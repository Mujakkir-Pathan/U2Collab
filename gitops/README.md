# GitOps on EKS — how the pieces fit

```
gitops/
  argocd/
    platform.yaml           app-of-apps: installs the whole platform below
    u2collab-raw.yaml       the app from k8s/            -> namespace u2collab
    u2collab-helm.yaml      the app from helm/u2collab   -> namespace u2collab-helm
    install-values.yaml     values for a manual helm install of ArgoCD
    platform/               the platform children, ordered by sync-wave

  gateway/gatewayclass.yaml         GatewayClass 'envoy' (Envoy Gateway)
  cert-manager/clusterissuers.yaml  letsencrypt-staging + letsencrypt-prod
  external-secrets/                 ClusterSecretStore -> AWS Secrets Manager

  observability/
    *-values.yaml           per-chart Helm values (Loki, Tempo, Prometheus,
                            OTel collectors, Grafana)
    manifests/              ServiceMonitors, PrometheusRule, Envoy telemetry
```

## The flow

1. **Terraform** (`../terraform`) creates the EKS cluster, the `gp3`
   StorageClass, the Secrets Manager container `u2collab/server`, and installs
   ArgoCD.
2. **scripts/deploy.sh** installs Envoy Gateway, applies the `platform`
   app-of-apps, then applies `u2collab-raw` (and optionally `u2collab-helm`).
3. **ArgoCD** syncs everything from this repo on every push — prune and
   selfHeal on. Deploying = merging to `main`.
4. **GitHub Actions** builds images, pushes them to Docker Hub with an
   immutable `sha-*` tag, then commits the new tag back into `k8s/` and
   `helm/u2collab/values.yaml`. ArgoCD notices and rolls the cluster.

## Platform children (sync-waves)

| Wave | App | What |
| ---- | --- | ---- |
| 0 | external-secrets, cert-manager | operators (CRDs first) |
| 1 | external-secrets-config, cert-manager-config | ClusterSecretStore, ClusterIssuers |
| 1 | observability-loki, tempo, prometheus | storage + TSDB |
| 2 | observability-collector-gateway, collector-agent | OTel pipeline |
| 3 | observability-grafana | UI |
| 4 | observability-config | ServiceMonitors, PrometheusRule, Envoy telemetry |

No Ollama here — U2Collab has no AI service.

## Namespaces

`u2collab` (raw stack), `u2collab-helm` (helm stack), `argocd`,
`cert-manager`, `external-secrets`, `envoy-gateway-system`, `observability`,
`kube-system`.

## Secrets

Nothing sensitive is in Git. AWS Secrets Manager key **`u2collab/server`**
holds a JSON document:

```json
{
  "MONGO_URI": "mongodb+srv://...",
  "JWT_SECRET": "...",
  "GOOGLE_CLIENT_ID": "...",
  "GOOGLE_CLIENT_SECRET": "...",
  "GITHUB_CLIENT_ID": "...",
  "GITHUB_CLIENT_SECRET": "...",
  "CLIENT_URL": "http://<public-client-origin>"
}
```

ExternalSecret turns it into the `u2collab-secrets` Secret in the app
namespaces. `CLIENT_URL` must equal the public origin of the client exactly —
it drives CORS, Socket.IO CORS and the OAuth redirects.

## TLS + cookies

The server sets `secure, sameSite=none` cookies when `NODE_ENV=production`.
Browsers only send those over HTTPS. Either:

- enable `gateway.tls` in the Helm values (and set a real hostname), or
- run on plain HTTP and set `server.nodeEnv=development` / `NODE_ENV=development`.
