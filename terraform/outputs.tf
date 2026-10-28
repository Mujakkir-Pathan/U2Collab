output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_version" {
  description = "Kubernetes version running on the control plane"
  value       = module.eks.cluster_version
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN, for anything still using IRSA rather than Pod Identity"
  value       = module.eks.oidc_provider_arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs — worker nodes live here"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs — the Envoy Gateway NLB lands here"
  value       = module.vpc.public_subnets
}

output "server_secret_name" {
  description = "Secrets Manager secret name the ExternalSecret must reference"
  value       = aws_secretsmanager_secret.server.name
}

output "server_secret_arn" {
  description = "Secrets Manager secret ARN. Note this is the CONTAINER — the values are not in Terraform state; see secrets.tf."
  value       = aws_secretsmanager_secret.server.arn
}

output "external_secrets_role_arn" {
  description = "IAM role External Secrets Operator assumes via its Pod Identity association"
  value       = module.external_secrets_pod_identity.iam_role_arn
}

output "configure_kubectl" {
  description = "Point kubectl at the new cluster"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.region}"
}

output "argocd_initial_password" {
  description = "Read ArgoCD's generated admin password"
  value       = "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
}

output "set_server_secret" {
  description = <<-EOT
    Put the server credentials into Secrets Manager. This is the TEMPLATE —
    paste your real MongoDB Atlas URI, OAuth credentials and public CLIENT_URL
    into it. The JWT_SECRET is generated fresh, so secrets never transit Terraform state.
  EOT

  value = <<-EOT
    JWT=$(openssl rand -hex 32)
    aws secretsmanager put-secret-value \
      --secret-id ${aws_secretsmanager_secret.server.name} \
      --region ${var.region} \
      --secret-string "$(jq -nc \
          --arg mongo "mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority" \
          --arg jwt "$JWT" \
          --arg google_id "" --arg google_secret "" \
          --arg github_id "" --arg github_secret "" \
          --arg client_url "http://<public-client-origin>" \
          '{MONGO_URI:$mongo, JWT_SECRET:$jwt, \
            GOOGLE_CLIENT_ID:$google_id, GOOGLE_CLIENT_SECRET:$google_secret, \
            GITHUB_CLIENT_ID:$github_id, GITHUB_CLIENT_SECRET:$github_secret, \
            CLIENT_URL:$client_url}')"
  EOT
}
