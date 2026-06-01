#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SERVICES=(
	"order-service"
	"tracking-service"
	"notification-service"
	"reporting-service"
)

for service in "${SERVICES[@]}"; do
	echo "--- Deploying $service ---"
	export LOCALSTACK_ENDPOINT_FILE="$ROOT_DIR/apps/$service/localstack-endpoints.json"
	pnpm serverless deploy --stage local \
		--config "$ROOT_DIR/apps/$service/serverless.yml"
done
