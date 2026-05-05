variable "project_name" {
  type = string
}

variable "env" {
  type = string
}

variable "table_suffix" {
  type        = string
  description = "Suffix appended after project_name-env- to form the table name"
}
