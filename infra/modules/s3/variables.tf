variable "project_name" {
  type = string
}

variable "env" {
  type = string
}

variable "bucket_suffix" {
  type        = string
  description = "Suffix appended after project_name-env- to form the bucket name"
}
