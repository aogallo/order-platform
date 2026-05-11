import json
import os
from datetime import UTC, datetime

import boto3

from app.domain.models.events import OrderEvent

_region_name = os.environ.get("AWS_REGION", "us-east-1")


def store_raw_event(event: OrderEvent) -> None:
    _client = boto3.client("s3", region_name=_region_name)
    _bucket = os.environ["S3_BUCKET_NAME"]
    now = datetime.now(UTC)
    key = f"{now.year}/{now.month:02d}/{now.day:02d}/{event.type}/{event.orderId}_{now.isoformat()}.json"

    _client.put_object(
        Bucket=_bucket,
        Key=key,
        Body=json.dumps(event.model_dump()),
        ContentType="application/json",
    )
