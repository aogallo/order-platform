#!/usr/bin/env bash
set -euo pipefail

export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

echo "=== Bootstrap: Seeding DynamoDB ==="
aws dynamodb put-item \
	--table-name order-platform-order-events-local \
	--item '{"pk": {"S":"config"}, "sk":{"S":"seed"}, "status": {"S":"done"}}'

echo "   Cognito user creation skipped (LocalStack free tier)"
echo "   Upgrade to LocalStack Pro to test Cognito locally"

echo "✅ Bootstrap complete"
