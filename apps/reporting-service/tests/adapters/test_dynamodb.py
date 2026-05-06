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


@mock_aws
def test_put_event_writes_item():
    boto3.client("dynamodb", region_name="us-east-1").create_table(
        TableName="test-order-events",
        KeySchema=[
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "sk", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )

    from app.adapters.dynamodb import put_event

    event = OrderCreated(type="order.created", orderId="abc-1234", total=99.99)
    put_event(event)

    table = boto3.resource("dynamodb", region_name="us-east-1").Table(
        "test-order-events"
    )
    items = table.scan()["Items"]
    assert len(items) == 1
    assert items[0]["pk"] == "ORDER#abc-1234"
    assert items[0]["event_type"] == "order.created"
    assert items[0]["source"] == "order-service"
