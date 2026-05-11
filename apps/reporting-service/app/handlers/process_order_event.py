import json
import logging
from typing import Any

from pydantic import ValidationError

from app.domain.models.events import OrderCreated, OrderUpdated
from app.use_cases.process_order import process_order_event

logger = logging.getLogger(__name__)


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    batch_item_failures = []

    for record in event.get("Records", []):
        message_id = record["messageId"]

        try:
            body = json.loads(record["body"])
        except (json.JSONDecodeError, KeyError):
            logger.error("Invalid JSON in SQS message %s - skipping", message_id)
            continue

        event_type = body.get("type")

        try:
            if event_type == "order.created":
                order_event = OrderCreated(**body)
            elif event_type == "order.updated":
                order_event = OrderUpdated(**body)
            else:
                logger.warning(
                    "Unknown event type %s in message %s", event_type, message_id
                )
                continue

        except ValidationError as e:
            logger.error("Validation error in message %s: %s - skipping", message_id, e)
            continue

        try:
            process_order_event(order_event)
        except Exception as e:
            logger.error("Failed to process message %s: %s - will retry", message_id, e)
            batch_item_failures.append({"itemIdentifier": message_id})

    return {"batchItemFailures": batch_item_failures}
