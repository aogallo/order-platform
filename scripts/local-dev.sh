#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting local dev environment..."

# Step 1: Docker up
echo "--- Step 1: Starting Docker services ---"
docker compose -f "$ROOT_DIR/docker/docker-compose.yml" up -d

# Step 2: Wait for LocalStack health
echo "--- Step 2: Waiting for LocalStack ---"
for i in $(seq 1 30); do
	if curl -sf http://localhost:4566/_localstack/health >/dev/null 2>&1; then
		echo "✅ LocalStack ready"
		break
	fi
	if [ "$i" -eq 30 ]; then
		echo "❌ LocalStack failed to start in 30s"
		exit 1
	fi
	sleep 2
done

# Step 3: Set LocalStack env vars
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_PAGER=""

# Step 3.5: Pre-create SQS queues for Serverless event source mappings
echo "--- Step 3.5: Pre-creating SQS queues ---"
aws sqs create-queue --queue-name order-events --endpoint-url "$AWS_ENDPOINT_URL" --region "$AWS_DEFAULT_REGION" 2>/dev/null || true
aws sqs create-queue --queue-name order-notifications --endpoint-url "$AWS_ENDPOINT_URL" --region "$AWS_DEFAULT_REGION" 2>/dev/null || true

# Step 4: Deploy all Serverless services (Lambda FIRST)
echo "--- Step 4 Deploying Serverless services ---"
"$SCRIPT_DIR/deploy-all.sh"

# Step 5: Apply Terraform infra (depends on Lambdas existing)
echo "--- Step 5: Applying Terraform infra ---"
tflocal -chdir="$ROOT_DIR/infra/environments/dev" init
tflocal -chdir="$ROOT_DIR/infra/environments/dev" apply -auto-approve \
	-target=module.order_events_dynamodb \
	-target=module.tracking_dynamodb \
	-target=module.order_events_sqs \
	-target=module.order_events_s3 \
	-var="project_name=order-platform" \
	-var="env=local" \
	-var="region=us-east-1" \
	-var="tags={}"

# Step 6: Bootstrap seed data
echo "--- Step 6: Bootstrapping seed data ---"
"$SCRIPT_DIR/bootstrap.sh"

echo "✅ Local dev environment is ready!"
echo "   API Gateway: http://localhost:4566/restapis/<id>/local"
echo "   MailHog UI: http://localhost:8025"
