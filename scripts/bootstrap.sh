#!/usr/bin/env bash
set -euo pipefail

export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

COGNITO_POOL_ID=$(aws cognito-idp list-user-pools --max-results 10 \
	--query "UserPools[?Name=='order-platform-local-user-pool'].Id" \
	--output text)

echo "=== Bootstrap: Creating test user ==="
aws cognito-idp admin-create-user \
	--user-pool-id "$COGNITO_POOL_ID" \
	--username admin@test.com \
	--temporary-password "Test1234!" \
	--user-attributes Name=email,Value=admin@test.com Name=email_verified,Value=true

aws cognito-idp admin-add-user-to-group \
	--user-pool-id "$COGNITO_POOL_ID" \
	--username admin@test.com \
	--group-name admin

echo "=== Bootstrap: Seeding DynamoDB ==="
aws dynamodb put-item \
	--table-name order-platform-order-events-local \
	--item '{"pk": {"S":"config"}, "sk":{"S":"seed"}, "status": {"S":"done"}}'

echo "✅ Bootstrap complete"
