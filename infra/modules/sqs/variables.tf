variable "project_name" {
  type = string
}

variable "env" {
  type = string
}

variable "queue_suffix" {
  type        = string
  description = "Suffix appended after project_name-env- to form the queue name"
}

variable "dlq_retention_seconds" {
  type        = number
  description = "DLQ message retention in seconds"
  default     = 1209600 # 14 days
}

variable "max_receive_count" {
  type        = number
  description = "Number of retries before sending to DLQ"
  default     = 3
}
