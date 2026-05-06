import os
from datetime import UTC, datetime

import boto3

from app.domain.models.events import OrderEvent

_region_name = os.environ.get("AWS_REGION", "us-east-1")

_client = boto3.client("dynamodb", region_name=_region_name)

_table = os.environ.get("DYNAMO_TABLE_NAME", "test-order-events")


def put_event(event: OrderEvent) -> None:
    now = datetime.now(UTC).isoformat()
    _client.put_item(
        TableName=_table,
        Item={
            "pk": {"S": f"ORDER#{event.orderId}"},
            "sk": {"S": f"EVENT#{event.type}#{now}"},
            "event_type": {"S": event.type},
            "payload": {"S": event.model_dump_json()},
            "processed_at": {"S": now},
            "source": {"S": "order-service"},
        },
    )
