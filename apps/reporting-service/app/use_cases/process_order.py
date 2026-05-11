from app.adapters import dynamodb, s3
from app.domain.models.events import OrderEvent


def process_order_event(event: OrderEvent) -> None:
    dynamodb.put_event(event)
    s3.store_raw_event(event)
