from unittest.mock import patch

import pytest
from app.domain.models.events import OrderCreated
from app.use_cases.process_order import process_order_event
from moto import mock_aws


@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test")
    monkeypatch.setenv("DYNAMO_TABLE_NAME", "test-order-events")


@mock_aws
def test_calls_both_adapters():
    event = OrderCreated(type="order.created", orderId="xyzk-45", total=28.09)

    with (
        patch("app.use_cases.process_order.dynamodb.put_event") as mock_db,
        patch("app.use_cases.process_order.s3.store_raw_event") as mock_s3,
    ):
        process_order_event(event)

        mock_db.assert_called_once_with(event)
        mock_s3.assert_called_once_with(event)


@mock_aws
def test_propagates_dynamodb_failure():
    event = OrderCreated(type="order.created", orderId="xyzk-45", total=28.09)
    with (
        patch(
            "app.use_cases.process_order.dynamodb.put_event",
            side_effect=Exception("DynamoDB down"),
        ),
        patch("app.use_cases.process_order.s3.store_raw_event") as mock_s3,
    ):
        with pytest.raises(Exception, match="DynamoDB down"):
            process_order_event(event)

        mock_s3.assert_not_called()
