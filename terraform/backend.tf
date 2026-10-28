terraform {
  # Partial config on purpose: bucket names are globally unique, so the rest
  # comes from backend.hcl at init time. See Deploy.md section 2.
  backend "s3" {}
}
