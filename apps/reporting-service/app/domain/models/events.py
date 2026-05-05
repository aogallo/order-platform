from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict


class OrderCreated(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    type: Literal["order.created"]
    orderId: str
    total: float


class OrderUpdated(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    type: Literal["order.updated"]
    orderId: str
    status: Literal["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]


OrderEvent = Annotated[Union[OrderCreated, OrderUpdated], ...]
