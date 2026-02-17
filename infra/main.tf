terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "manifold-terraform-state"
    prefix = "manifold"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

locals {
  static_ip_name = var.static_ip_name != "" ? var.static_ip_name : "${var.instance_name}-ip"
}

resource "google_compute_address" "static_ip" {
  name   = local.static_ip_name
  region = var.region
}

resource "google_compute_instance" "manifold" {
  name                      = var.instance_name
  machine_type              = var.machine_type
  zone                      = var.zone
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2404-lts-amd64"
      size  = 50
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.static_ip.address
    }
  }

  tags = ["http-server", "https-server"]

  service_account {
    email  = "default"
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
    startup-script = file("${path.module}/startup.sh")
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
  }
}

output "static_ip" {
  description = "The static IP address assigned to the instance"
  value       = google_compute_address.static_ip.address
}

output "instance_name" {
  description = "The name of the created instance"
  value       = google_compute_instance.manifold.name
}
