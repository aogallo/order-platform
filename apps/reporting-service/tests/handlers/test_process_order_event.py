from unittest.mock import patch

from app.handlers.process_order_event import handler


def _record(message_id: str, body: str) -> dict:
    return {"messageId": message_id, "body": body}


def _event(*records) -> dict:
    return {"Records": list(records)}


def test_valid_order_created_is_processed():
    body = '{"type": "order.created", "orderId": "123", "total": 99.01}'

    with patch("app.handlers.process_order_event.process_order_event") as mock_uc:
        result = handler(_event(_record("msg-1", body)), None)

    mock_uc.assert_called_once()
    assert result == {"batchItemFailures": []}


def test_invalid_json_skips_silently():
    with patch("app.handlers.process_order_event.process_order_event") as mock_uc:
        result = handler(_event(_record("msg-1", "not-json")), None)

    mock_uc.assert_not_called()
    assert result == {"batchItemFailures": []}


def test_unknown_event_type_skips_silently():
    body = '{"type": "order.deleted", "orderId": "123"}'

    with patch("app.handlers.process_order_event.process_order_event") as mock_uc:
        result = handler(_event(_record("msg-1", body)), None)

    mock_uc.assert_not_called()
    assert result == {"batchItemFailures": []}


def test_use_case_failure_returns_batch_item_failure():
    body = '{"type": "order.created", "orderId": "123", "total": 50.1}'

    with patch(
        "app.handlers.process_order_event.process_order_event",
        side_effect=Exception("DynamoDB timeout"),
    ):
        result = handler(_event(_record("msg-1", body)), None)

    assert result == {"batchItemFailures": [{"itemIdentifier": "msg-1"}]}


def test_partial_batch_only_fails_broken_messages():
    good = _record(
        "msg-1", '{"type": "order.created", "orderId": "aaa", "total": 10.0}'
    )
    bad_json = _record("msg-2", "not-json")
    failing = _record("msg-3", '{"type": "order.created", "orderId": "bbb"')
    good = _record(
        "msg-1", '{"type": "order.created", "orderId": "aaa", "total": 10.0}'
    )
    bad_json = _record("msg-2", "not-json")
    bad_json = _record("msg-2", "not-json")
    failing = _record(
        "msg-3", '{"type": "order.created", "orderId": "bbb", "total": 20.0}'
    )

    call_count = 0

    def side_effect(e):
        nonlocal call_count
        call_count += 1
        if call_count == 2:
            raise Exception("timeout")

    with patch(
        "app.handlers.process_order_event.process_order_event", side_effect=side_effect
    ):
        result = handler(_event(good, bad_json, failing), None)

    assert result == {"batchItemFailures": [{"itemIdentifier": "msg-3"}]}
