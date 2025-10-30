# python_services/schemas.py
from enum import Enum
from pydantic import BaseModel, Field, create_model
from typing import Type

class ACMode(str, Enum):
    OFF = "OFF"
    COOL = "COOL"
    FAN = "FAN"

class DoorWindowState(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class ExhaustFanState(str, Enum):
    ON = "ON"
    OFF = "OFF"

def create_appliance_schema(appliances: dict) -> Type[BaseModel]:
    """Dynamically generate schema fields based on available appliances."""

    fields = {
        "reason": (str, ...),
        "RECHECK_AT": (int, Field(description="Minutes to recheck recommendation")),
    }

    if appliances.get("AC"):
        fields["AC_MODE"] = (ACMode, ...)
        fields["AC_TEMPERATURE"] = (
            int,
            Field(ge=16, le=30, description="Valid range: 16–30°C"),
        )

    if appliances.get("CEILING_FAN"):
        fields["CEILING_FAN"] = (
            int,
            Field(ge=0, le=5, description="Valid speed: 0–5"),
        )

    if appliances.get("WINDOW"):
        fields["WINDOW"] = (DoorWindowState, ...)

    if appliances.get("DOOR"):
        fields["DOOR"] = (DoorWindowState, ...)

    if appliances.get("EXHAUST_FAN"):
        fields["EXHAUST_FAN"] = (ExhaustFanState, ...)

    return create_model("DynamicApplianceSettings", **fields)
