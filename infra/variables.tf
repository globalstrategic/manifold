variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}

variable "instance_name" {
  type    = string
  default = "manifold-01"
}

variable "machine_type" {
  type    = string
  default = "e2-standard-2"
}

variable "static_ip_name" {
  description = "Name for the static IP address resource. If not provided, uses instance_name-ip"
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "GitHub repo in owner/name format for Workload Identity Federation"
  type        = string
  default     = "globalstrategic/manifold"
}
