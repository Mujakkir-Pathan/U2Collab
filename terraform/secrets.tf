resource "aws_secretsmanager_secret" "server" {
  name        = var.server_secret_name
  description = "U2Collab server credentials JSON (MONGO_URI, JWT_SECRET, Google/GitHub OAuth, CLIENT_URL). Value set out of band; see Deploy.md."

  # 0 = delete now. The 30-day default blocks recreating this secret for a month after destroy.
  recovery_window_in_days = 0

  tags = local.tags
}
