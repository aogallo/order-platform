import boto3
import pytest
from app.domain.models.events import OrderCreated
from moto import mock_aws


@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test")
    monkeypatch.setenv("DYNAMODB_TABLE_NAME", "test-order-events")
    monkeypatch.setenv("S3_BUCKET_NAME", "test-order-events")


@mock_aws
def test_store_raw_event_writes_object():
    boto3.client("s3", region_name="us-east-1").create_bucket(
        Bucket="test-order-events"
    )

    from app.adapters.s3 import store_raw_event

    event = OrderCreated(type="order.created", orderId="abc-1234", total=49.32)

    store_raw_event(event)

    bucket = boto3.resource("s3", region_name="us-east-1").Bucket("test-order-events")
    objects = list(bucket.objects.all())
    assert len(objects) == 1
