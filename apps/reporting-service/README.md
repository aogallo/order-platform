# reporting-service

Event-driven analytics consumer for the order-platform. Processes `OrderCreated` and `OrderUpdated` events from SQS and persists them to DynamoDB (hot store) and S3 (bulk analytics).

## Architecture

```
order-service ──→ SQS (order-events) ──→ reporting-service (Lambda)
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                    ▼
                                DynamoDB               S3
                            (per-order query)    (time-partitioned)
```

## Stack

- **Runtime**: Python 3.12 (AWS Lambda)
- **Package manager**: uv
- **Linting**: ruff
- **Type checking**: mypy (strict)
- **Testing**: pytest + moto
- **Infrastructure**: Terraform (SQS, DynamoDB, S3) + Serverless Framework (Lambda)

## Project structure

```
apps/reporting-service/
├── app/
│   ├── domain/models/       # Pydantic models (OrderCreated, OrderUpdated)
│   ├── adapters/            # DynamoDB + S3 writers
│   ├── use_cases/           # process_order orchestration
│   └── handlers/            # SQS Lambda entry point
├── tests/
│   ├── domain/              # Model validation tests
│   ├── adapters/            # Storage adapter tests (moto)
│   ├── use_cases/           # Use case tests
│   └── handlers/            # Lambda handler tests
├── serverless.yml           # Serverless Framework config
├── pyproject.toml           # uv + ruff + mypy + pytest config
└── Dockerfile               # Lambda container image
```

## Development

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest -v

# Lint
uv run ruff check app/
uv run ruff format --check app/

# Type check
uv run mypy app/
```

## Local testing with LocalStack

```bash
# Start LocalStack
localstack start

# Deploy infra
cd infra/environments/dev
terraform init && terraform apply -auto-approve

# Invoke the Lambda handler locally
cd apps/reporting-service
DYNAMODB_TABLE=order-events \
S3_BUCKET=order-events-dev \
AWS_ENDPOINT_URL=http://localhost:4566 \
  uv run python -c "
import json
from app.handlers.process_order_event import handler

event = {
    'Records': [{
        'messageId': 'test-1',
        'body': json.dumps({
            'type': 'order.created',
            'orderId': 'a3f1c8b4-1111',
            'total': 99.99
        })
    }]
}
result = handler(event, None)
print(result)
"
```

## Deployment

Deployed via GitHub Actions on push to `main`. Pipeline defined in `.github/workflows/platform.yml`.

## Event contract

See `packages/event-schema/` for the JSON Schema definitions shared across services.
