import pytest
from pydantic import ValidationError

from app.domain.models.events import OrderCreated, OrderUpdated


class TestOrderCreated:
    def test_valid_payload(self):
        event = OrderCreated(type="order.created", orderId="123", total=99.99)
        assert event.orderId == "123"
        assert event.total == 99.99

    def test_missing_required_field_raises(self):
        with pytest.raises(ValidationError):
            OrderCreated(type="order.created", orderId="123")  # missing total

    def test_wrong_type_literal_raises(self):
        with pytest.raises(ValidationError):
            OrderCreated(type="order.updated", orderId="123", total=10.0)

    def test_extra_field_raises(self):
        with pytest.raises(ValidationError):
            OrderCreated(
                type="order.created", orderId="123", total=99.99, unknown="extra"
            )

    def test_negative_total_is_valid(self):
        # Domain model does not enforce business rules — that's the use case's job
        event = OrderCreated(type="order.created", orderId="abc", total=-1.0)
        assert event.total == -1.0

    def test_model_is_frozen(self):
        event = OrderCreated(type="order.created", orderId="123", total=99.99)
        with pytest.raises(Exception):
            event.orderId = "mutated"  # type: ignore[misc]


class TestOrderUpdated:
    def test_valid_payload(self):
        event = OrderUpdated(type="order.updated", orderId="456", status="CONFIRMED")
        assert event.status == "CONFIRMED"

    def test_invalid_status_raises(self):
        with pytest.raises(ValidationError):
            OrderUpdated(type="order.updated", orderId="456", status="UNKNOWN")

    def test_missing_order_id_raises(self):
        with pytest.raises(ValidationError):
            OrderUpdated(type="order.updated", status="PENDING")  # type: ignore[call-arg]

    def test_all_valid_statuses(self):
        for status in ("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"):
            event = OrderUpdated(type="order.updated", orderId="789", status=status)
            assert event.status == status

    def test_extra_field_raises(self):
        with pytest.raises(ValidationError):
            OrderUpdated(
                type="order.updated", orderId="456", status="PENDING", extra="bad"
            )
