#!/usr/bin/env bash
set -euo pipefail

REGION="${REGION:-us-west-2}"
CLUSTER="${CLUSTER:-u2collab}"
EG_VERSION="${EG_VERSION:-v1.2.1}"

cd "$(dirname "$0")/.."

say()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m  ✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m  ! %s\033[0m\n' "$*"; }

# --- 0. Preflight ---
say "Preflight"

for bin in kubectl helm aws git; do
  command -v "$bin" >/dev/null || { echo "missing: $bin"; exit 1; }
done

aws eks update-kubeconfig --name "$CLUSTER" --region "$REGION" >/dev/null
ok "kubeconfig -> $(kubectl config current-context)"

kubectl get nodes >/dev/null
ok "$(kubectl get nodes --no-headers | wc -l | tr -d ' ') nodes reachable"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if ! git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "Branch '$BRANCH' is not on origin. ArgoCD can only sync what it can fetch."
  echo "  git push -u origin $BRANCH"
  exit 1
fi
if [ -n "$(git log "origin/$BRANCH..$BRANCH" --oneline)" ]; then
  warn "local commits not yet pushed — ArgoCD will deploy the REMOTE state"
fi
ok "branch '$BRANCH' is on origin"

if ! aws secretsmanager get-secret-value \
      --secret-id u2collab/server --region "$REGION" >/dev/null 2>&1; then
  echo "Secrets Manager secret 'u2collab/server' has no value yet."
  echo "Run the 'set_server_secret' command from: terraform output"
  exit 1
fi
ok "u2collab/server has a value"

# --- 1. Envoy Gateway ---
say "Envoy Gateway ($EG_VERSION)"
helm upgrade --install eg oci://docker.io/envoyproxy/gateway-helm \
  --version "$EG_VERSION" \
  -n envoy-gateway-system --create-namespace \
  --wait --timeout 10m >/dev/null
ok "controller ready"

kubectl apply -f gitops/gateway/gatewayclass.yaml >/dev/null
ok "GatewayClass 'envoy' applied"

# --- 2. Platform (app-of-apps) ---
say "Platform: ESO + observability"
kubectl apply -f gitops/argocd/platform.yaml >/dev/null
ok "app-of-apps applied — ArgoCD is now creating its children"

wait_for() { # wait_for <namespace> <resource> [timeout-seconds]
  local ns="$1" res="$2" limit="${3:-600}" waited=0
  until kubectl -n "$ns" get "$res" >/dev/null 2>&1; do
    [ "$waited" -ge "$limit" ] && return 1
    sleep 10; waited=$((waited + 10))
  done
}

say "Waiting for External Secrets Operator"
if wait_for external-secrets deploy/external-secrets 600 &&
   kubectl -n external-secrets rollout status deploy/external-secrets --timeout=8m >/dev/null 2>&1; then
  ok "ESO ready"
else
  warn "not ready — check: kubectl -n argocd get app external-secrets"
fi

say "Waiting for cert-manager"
if wait_for cert-manager deploy/cert-manager 600 &&
   kubectl -n cert-manager rollout status deploy/cert-manager --timeout=8m >/dev/null 2>&1; then
  ok "cert-manager ready"
  # The chart passes gatewayAPI via --config, not a CLI flag, so read the
  # ControllerConfiguration ConfigMap rather than the container args.
  kubectl -n cert-manager get cm cert-manager \
    -o jsonpath='{.data.config\.yaml}' 2>/dev/null \
    | grep -A1 'gatewayAPI' | grep -q 'enabled: true' \
    && ok "Gateway API support on" \
    || warn "Gateway API support off: restart it (kubectl -n cert-manager rollout restart deploy cert-manager)"
else
  warn "not ready — check: kubectl -n argocd get app cert-manager"
fi

# --- 3. The application ---
say "U2Collab (raw manifests -> namespace 'u2collab')"
kubectl apply -f gitops/argocd/u2collab-raw.yaml >/dev/null
ok "u2collab-raw applied"

# Uncomment for the second stack. Costs a second NLB (~$17/mo).
# kubectl apply -f gitops/argocd/u2collab-helm.yaml >/dev/null

# --- 4. Verify ---
say "Waiting for the app to settle"

if wait_for u2collab deploy/u2collab-server-deployment 600 &&
   kubectl -n u2collab wait --for=condition=available --timeout=10m \
     deploy/u2collab-server-deployment deploy/u2collab-client-deployment >/dev/null 2>&1; then
  ok "server and client available"
else
  warn "app not ready — see the secret/network checks below"
fi

say "Status"

echo "--- ArgoCD applications ---"
kubectl -n argocd get applications \
  -o custom-columns=NAME:.metadata.name,SYNC:.status.sync.status,HEALTH:.status.health.status 2>/dev/null

echo
echo "--- the Secret ESO built from AWS ---"
echo "    keys: MONGO_URI JWT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET CLIENT_URL PORT NODE_ENV"

echo
echo "--- pods ---"
kubectl get pods -A 2>/dev/null \
  | grep -E 'NAMESPACE|u2collab|observability' | head -30

say "Public URL"
for i in $(seq 1 30); do
  ADDR="$(kubectl -n u2collab get gateway u2collab-gateway \
          -o jsonpath='{.status.addresses[0].value}' 2>/dev/null || true)"
  [ -n "$ADDR" ] && break
  sleep 10
done

if [ -n "${ADDR:-}" ]; then
  ok "http://$ADDR"
  echo
  echo "    curl -s http://$ADDR/api/health"
  echo "    open http://$ADDR/"
  echo
  echo "    kubectl -n observability port-forward svc/observability-grafana 3000:80"
else
  warn "Gateway has no address yet: kubectl -n u2collab get gateway u2collab-gateway"
fi

say "Done. Tear down with Deploy.md section 14 — namespaces BEFORE terraform destroy."
