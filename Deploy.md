# Deploy U2Collab to EKS

U2Collab runs on AWS EKS with GitOps (ArgoCD), Gateway API (Envoy Gateway),
External Secrets (AWS Secrets Manager) and optional HTTPS via cert-manager.
The database is **MongoDB Atlas** — there is no in-cluster database, so the
whole platform is the app + the platform services.

**Flow:** GitHub Actions builds images → pushes `sha-*` tags to Docker Hub →
commits the tags back into `k8s/` + `helm/u2collab/values.yaml` → ArgoCD
(prune + selfHeal) rolls the cluster. Deploying = merging to `main`.

> Shortcut: `scripts/deploy.sh` runs sections 6, 8, 9 (raw stack) and a
> partial 10 (waits for the Gateway address and prints the smoke-test curls
> — you run them). It skips section 7 (ArgoCD login) entirely, after
> sections 1–5 are done once.

```
Sections
  0  Before you start          7  Log in to ArgoCD
  1  Create the state bucket   8  Install the platform
  2  Point Terraform at it     9  Deploy the app
  3  Build the cluster        10  Public URL and smoke test
  4  Set the server secret    11  HTTPS on your own domain
  5  Push your branch         12  Observability
  6  Install Envoy Gateway    13  CI/CD
                             14  Tear it all down
                             15  Troubleshooting
```

## 0. Before you start

### 0.1 Tools

```
aws  v2   terraform >= 1.11   kubectl 1.34.x   helm 3.x   git   jq
```

No Docker needed locally — GitHub Actions builds the images. The `ansible/`
playbooks install all of this on a fresh Ubuntu box:

```bash
cd ansible && ansible-playbook -i inventory.ini site.yml
```

### 0.2 AWS credentials

Any identity that can create VPC, EKS, IAM, S3 and Secrets Manager resources:

```bash
aws sts get-caller-identity
```

### 0.3 Fork and rewire

ArgoCD deploys from `gitops/argocd/*.yaml`'s `repoURL`. If you forked, change
these **before** anything else:

```bash
# Linux (GNU sed):
sed -i 's|Mujakkir-Pathan/U2Collab|YOUR-USERNAME/U2Collab|g' \
  gitops/argocd/*.yaml gitops/argocd/platform/*.yaml ansible/group_vars/u2collab.yml
```

Also set `repo_url` in `ansible/group_vars/u2collab.yml` to your fork.

### 0.4 Changing region — the four places

```bash
grep -rn "us-west-2" terraform/ gitops/ ansible/ scripts/ | grep -v '\.terraform/'
# 1 — terraform/terraform.tfvars          region = "..."
# 2 — terraform/variables.tf              default = "..." (and terraform/bootstrap/variables.tf)
# 3 — gitops/external-secrets/cluster-secret-store.yaml   region: ...
# 4 — ansible/group_vars/u2collab.yml     aws_region: ...
# 5 — terraform/backend.hcl.example       bucket name + region (yours: backend.hcl)
# (scripts/deploy.sh reads REGION, default us-west-2)
```

## 1. Create the state bucket

```bash
cd terraform/bootstrap
terraform init
terraform apply
terraform output -raw backend_hcl
```

## 2. Point Terraform at that bucket

```bash
cd ..   # back to terraform/
# the backend_hcl output lives in the BOOTSTRAP state — chdir to it:
terraform -chdir=bootstrap output -raw backend_hcl > backend.hcl
# backend.hcl is gitignored — it has YOUR bucket name.
```

## 3. Build the cluster

```bash
terraform init -backend-config=backend.hcl   # backend "s3" {} reads the config from this file — plain `terraform init` will PROMPT for the bucket
terraform plan
terraform apply
aws eks update-kubeconfig --name u2collab --region us-west-2
kubectl get nodes
```

What you get: VPC (public/private/intra, single NAT), EKS 1.34 with managed
nodes, the `gp3` default StorageClass, the Secrets Manager secret container
`u2collab/server`, Pod Identity for EBS-CSI + External Secrets, and ArgoCD.

## 4. Set the server secret

Terraform created the *container*; the value goes in directly (never through
state):

```bash
terraform output -raw set_server_secret
```

Edit the template it prints — real Atlas URI, OAuth credentials, and
`CLIENT_URL` — then run it. The JSON **must** have exactly these keys:

| Key | Value |
| --- | ----- |
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app |
| `CLIENT_URL` | public origin of the client, exact (e.g. `http://a.b.nip.io`) |

OAuth callback URLs stay relative in the code
(`/api/auth/google/callback`, `/api/auth/github/callback`) — register them on
your **public** origin, e.g. `http://<nlb-host>/api/auth/google/callback`.

## 5. Push your branch

ArgoCD syncs the **remote**, not your laptop:

```bash
git add -A && git commit -m "gitops" && git push -u origin main
```

### ══ HARD GATE ══

If it is not on `origin`, nothing below can sync. The branch must exist
**and carry the GitOps content** — a branch with only the old app code
passes the first check and still syncs nothing.

```bash
git ls-remote --heads origin main          # must print a line
git ls-tree origin/main --name-only \
  gitops k8s helm terraform ansible scripts   # must list all five
```

## 6. Install Envoy Gateway

```bash
helm upgrade --install eg oci://docker.io/envoyproxy/gateway-helm \
  --version v1.2.1 -n envoy-gateway-system --create-namespace --wait

kubectl apply -f gitops/gateway/gatewayclass.yaml
kubectl get gatewayclass envoy
```

## 7. Log in to ArgoCD

Terraform installed it as a ClusterIP — tunnel instead of exposing it:

```bash
kubectl -n argocd port-forward svc/argocd-server 8080:443 &
# user: admin
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath='{.data.password}' | base64 -d
# open http://localhost:8080
#   (server.insecure=true means the server speaks plain HTTP — there is NO TLS
#    and NO browser warning; https:// will fail the handshake)
```

## 8. Install the platform

```bash
kubectl apply -f gitops/argocd/platform.yaml
```

The app-of-apps creates its children by sync-wave: operators (External
Secrets, cert-manager) → wave 1 in parallel (configs + Loki/Tempo/Prometheus)
→ OTel collectors → Grafana → rules (ServiceMonitors/PrometheusRule/Envoy
telemetry).

Watch them:

```bash
kubectl -n argocd get applications -w
```

## 9. Deploy the app

```bash
kubectl apply -f gitops/argocd/u2collab-raw.yaml
```

For the second stack (own NLB, ~$17/mo extra):

```bash
kubectl apply -f gitops/argocd/u2collab-helm.yaml
```

## 10. Public URL and smoke test

```bash
kubectl -n u2collab get gateway u2collab-gateway \
  -o jsonpath='{.status.addresses[0].value}'
```

Wait 2–3 minutes for the NLB, then:

```bash
ADDR=$(kubectl -n u2collab get gateway u2collab-gateway -o jsonpath='{.status.addresses[0].value}')

curl -s http://$ADDR/api/health       # {"status":"ok","db":"connected"}
curl -s -o /dev/null -w "%{http_code}\n" http://$ADDR/   # 200
open http://$ADDR/
```

Login goes through Google/GitHub → OAuth callback on this same origin →
redirect to `CLIENT_URL` + `/dashboard`. The `u2collab_token` cookie is
HttpOnly; with `NODE_ENV=production` it is `secure, sameSite=none` — over
plain HTTP your browser will **drop it**. Either finish section 11 (HTTPS) or:

```bash
# raw stack — NODE_ENV is a LITERAL in k8s/server-deployment.yml (the pod does
#   NOT read it from the secret), so edit it there:
#     k8s/server-deployment.yml  →  NODE_ENV: development
# helm stack:
helm upgrade u2collab helm/u2collab -n u2collab-helm --set server.nodeEnv=development
```

> The bare `helm upgrade` is a local-only stopgap — ArgoCD `selfHeal` reverts
> it within one sync window. The durable fix is a git change: set
> `server.nodeEnv=development` in `helm/u2collab/values.yaml`, commit, push.

> With `NODE_ENV=production`, the ExternalSecret templates
> (`k8s/external-secret.yml`, `helm/u2collab/templates/externalsecret.yaml`)
> also carry `PORT`/`NODE_ENV` keys — but on the **raw** stack the pod never
> references them (see above). On the **helm** stack the pod does read
> `NODE_ENV` from the secret, driven by `server.nodeEnv` in values.

## 11. HTTPS on your own domain

> This section is the **raw** stack (`k8s/`). For the helm stack, set
> `gateway.hostname` + `gateway.tls.enabled` in `helm/u2collab/values.yaml`
> and commit — do not edit `k8s/`. Note the helm chart defaults its Issuer to
> **letsencrypt-prod**; flip it to staging first (`issuer.name` in values).
> Either stack: update `CLIENT_URL` in the server secret to the new origin
> (section 4) after DNS cutover.

### 11.1 CNAME

Point your DNS name at the NLB:

```bash
aws elbv2 describe-load-balancers --query "LoadBalancers[?DNSName!=''].[DNSName]" --output text
# A/ALIAS at your registrar, or:  u2collab  CNAME  <nlb-dns>
```

### 11.2 Issue against staging first

Production allows only 5 Let's Encrypt failures/hour per hostname.

```bash
# Replace u2collab.example.com with YOUR domain in:
#   k8s/gateway.yml (https listener), k8s/httproute-redirect.yml,
#   k8s/certificate.yml (dnsNames)
# DO NOT `kubectl apply -f k8s/` blindly — k8s/ used to hold local-secret.yaml,
# a placeholder Secret with the SAME name as the ExternalSecret target
# (u2collab-secrets); it is now quarantined under examples/. Apply only the
# three files you edited:
kubectl apply -f k8s/gateway.yml -f k8s/httproute-redirect.yml -f k8s/certificate.yml
kubectl -n u2collab describe certificate u2collab-tls   # Ready=True?
```

### 11.3 Switch to production

```bash
kubectl -n u2collab describe certificate u2collab-tls \
  | grep -A2 'issuer'   # must NOT say (STAGING)
# flip issuerRef to letsencrypt-prod in k8s/certificate.yml, commit
```

### 11.4 HTTP → HTTPS redirect

`k8s/httproute-redirect.yml` already 301s the hostname to HTTPS. Verify:

```bash
curl -sI http://$ADDR/ | head -3   # Host: your.domain -> 301 Location: https://...
```

### 11.5 Cookies now work

Over HTTPS, `NODE_ENV=production` cookies are sent normally — re-login once
and you are done.

## 12. Observability

```bash
kubectl -n observability port-forward svc/observability-grafana 3000:80
# admin / u2collab
```

- **Traces**: Explore → Tempo → search. The app itself emits no OTLP yet
  (Node server has no SDK), but Envoy Gateway traces every request through
  the `EnvoyProxy` config in `gitops/observability/manifests/`.
- **Metrics**: Explore → Prometheus. `kube_*` coverage is complete; a
  ServiceMonitor covers the OTel collectors and a PodMonitor covers the
  Envoy proxies.
- **Logs**: Explore → Loki → `{k8s_namespace_name="u2collab"}`.
- **Alerts**: `gitops/observability/manifests/prometheusrule-u2collab.yaml`
  — secret missing, server crash-looping, server not ready, gateway without
  an address.

## 13. CI/CD

| Piece | What it does |
| --- | --- |
| `.github/workflows/devsecops.yml` | orchestrator on PR to `main` + push to `main` (push is **path-filtered** to `client/**`, `server/**`, `.github/workflows/**`, `sonar-project.properties` — gitops/k8s/terraform-only pushes do NOT trigger it) |
| code-quality / code-tests | client ESLint, server `node --check`, client build |
| secret-scanning | GitLeaks |
| dependency-scan | `npm audit` for client + server |
| docker-scans | hadolint + Trivy per Dockerfile |
| sonar-scan | SonarCloud (`sonar-project.properties`) |
| docker-push | builds `sha-*` + `latest` to Docker Hub |
| gitops-bump | commits the new tag into `k8s/` + `helm/u2collab/values.yaml` |
| terraform-ci | fmt/validate/tflint/checkov/trivy-config |
| dast | manual OWASP ZAP baseline against a URL |

`terraform-ci` and `dast` are **standalone** (own triggers: terraform-ci on
`terraform/**` paths, dast manual-only) — not called from devsecops. There is
also a manual-only `matrix.yml` (Node 20/22 lint matrix) duplicating parts of
code-quality.

Repository/Actions secrets needed: `DOCKERHUB_USERNAME` (var),
`DOCKERHUB_TOKEN`, `SONAR_TOKEN`, `SONAR_HOST_URL`.

The client image is built with **same-origin** URLs (`VITE_API_URL=/api`,
`VITE_SOCKET_URL=/`) — the Gateway routes `/api` and `/socket.io` to the
server, so no CORS round trip is needed from the browser's perspective
(CORS still applies for the OAuth redirects via `CLIENT_URL`).

The legacy EC2 compose flow has been removed — GitHub Actions + ArgoCD is
the only deploy path.

## 14. Tear it all down

Order matters — namespaces first, terraform last:

```bash
# 1. stop ArgoCD managing anything
kubectl -n argocd delete applications --all

# 2. delete the namespaces — THIS is what stops the billing
kubectl delete namespace u2collab u2collab-helm observability \
  cert-manager external-secrets envoy-gateway-system argocd

# 3. confirm they're gone
kubectl get ns

# 4. drop ArgoCD from Terraform state FIRST (its finalizers block otherwise)
terraform state rm helm_release.argocd[0]

# 5. remove the load balancers / leftover services, then:
terraform destroy

# 6. PVC-created EBS volumes can survive — delete any leftovers:
aws ec2 describe-volumes --region us-west-2 \
  --filters "Name=tag-key,Values=kubernetes.io/created-for/pvc/name" \
  --query "Volumes[].VolumeId" --output text

# 7. the state bucket, last
cd terraform/bootstrap && terraform destroy
```

## 15. Troubleshooting

### 15.1 Pods in `CreateContainerConfigError`

The `u2collab-secrets` Secret is missing or lacks a key the deployment
references:

```bash
kubectl -n u2collab describe externalsecret u2collab-secrets
aws secretsmanager get-secret-value --secret-id u2collab/server \
  --query SecretString --output text | jq 'keys'
```

Every key in the table in section 4 must exist.

### 15.2 Server crash-looping (`CrashLoopBackOff`)

`server/config/db.js` (called from `app.js`) does `process.exit(1)` when
MongoDB is unreachable at startup:

```bash
kubectl -n u2collab logs deploy/u2collab-server-deployment --tail=50
```

Usually: bad `MONGO_URI`, Atlas IP access-list not open to the cluster's
egress IPs (no NAT'd public IPs on private subnets → add the VPC CIDR or use
a VPC peer/endpoint), or expired Atlas credentials.

> Atlas + private-only nodes is the classic gotcha: worker nodes live in
> **private** subnets and egress through the single NAT gateway — those NAT
> IPs are what you allow-list in Atlas (`0.0.0.0/0` is the quick test).

### 15.3 `ImagePullBackOff`

```bash
kubectl -n u2collab describe pod -l app=u2collab-server
```

- `manifest unknown` → the tag in git was never pushed (check the
  `gitops-bump` Actions run, or Docker Hub tags).
- Docker Hub rate limits → nodes anonymous-pulling; mirror or add a secret.

### 15.4 ArgoCD `ComparisonError` / app `Unknown`

```bash
kubectl -n argocd get app u2collab-raw -o yaml | grep -A5 conditions
```

Almost always "repository not accessible" (wrong repoURL/branch — section
0.3) or a Helm render error (check the app's Sync JSON).

### 15.5 Gateway has no address after 5 minutes

```bash
kubectl -n u2collab describe gateway u2collab-gateway
kubectl -n envoy-gateway-system logs deploy/envoy-gateway --tail=100
```

Usually the NLB cannot be created: missing `kubernetes.io/role/elb=1` tags on
public subnets (they're set in `terraform/vpc.tf` — did you apply it?), or
AWS EIP quota exhausted.

### 15.6 Certificate stuck, or HTTPS not working

```bash
kubectl -n u2collab describe certificate u2collab-tls
kubectl -n cert-manager logs deploy/cert-manager --tail=50
```

- `Challenge` Pending forever → HTTP-01 reachability: the ACME server must hit
  `http://<domain>/.well-known/acme-challenge/...` on **:80**. Your DNS must
  point at the NLB first (section 11.1).
- `ResolvedRefs=False` on the https listener → `u2collab-tls` Secret doesn't
  exist yet; :80 keeps serving while you fix it.
- cert-manager not solving at all → Gateway API support off; restart it
  (`scripts/deploy.sh` preflight checks this — plain section 6 does not).

### 15.7 Login succeeds but every API call 401s / cookie never sticks

`CLIENT_URL` in the secret doesn't exactly match the origin you browse to
(scheme, host, port — no trailing slash), or you're on plain HTTP with
`NODE_ENV=production` (section 10).

### 15.8 Nothing you change sticks

ArgoCD `selfHeal` reverts manual `kubectl edit`/`patch`. Change it **in Git**
and push — that is the point.

### 15.9 Rooms split across pods / collaboration glitches

The server is pinned to **replicas: 1** on purpose: Yjs docs, whiteboard
shapes and presence live in in-memory Maps and Socket.IO has no Redis
adapter. Never scale `u2collab-server` without adding shared state first.
The client HPA is safe — it is stateless static files.
