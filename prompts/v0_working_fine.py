import os
import time
import requests
from datetime import datetime
from dotenv import load_dotenv
from enum import Enum
from google import genai
from pydantic import BaseModel, Field

load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')


# Define enums for fixed string choices
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

class ApplianceSettings(BaseModel):
    reason: str
    AC_MODE: ACMode
    AC_TEMPERATURE: int = Field(ge=16, le=30, description="Valid range: 16-30°C")
    CEILING_FAN: int = Field(ge=0, le=5, description="Valid speed: 0-5")
    WINDOW: DoorWindowState
    DOOR: DoorWindowState
    EXHAUST_FAN: ExhaustFanState
    RECHECK_AT:  int = Field(description="provide minutes to recheck the previous recommendations")
    



client = genai.Client(api_key=API_KEY)

room_info = {"length": 5.0, "breadth": 4.0, "occupancy": 2}
appliances = {"AC": True, "CEILING_FAN": True, "EXHAUST_FAN": False, "WINDOW": True, "DOOR": True}
user_info = {"username": "John", "age": 28, "gender": "Male", "health_issues": ["asthma"]}
pollutants = {"temperature": 35, "humidity": 65, "co2": 5000, "voc": 120, "pm2_5": 45, "pm10": 70, "timestamp":"2025-10-23 22:20:00"}

print(ACMode)
prompt = f"""
You are an intelligent indoor comfort and air-quality control system.

Input data:
- Room info: {room_info}
- Appliances: {appliances}
- User info: {user_info}
- Pollutants: {pollutants}

Goal:
1. Adjust appliance settings to increase comfort and reduce pollutants.
2. Explain briefly *why* each key change was made (or not needed).
3. Stay within valid ranges and allowed values:
   - AC_MODE: "OFF", "COOL", "FAN"
   - AC_TEMPERATURE: 16–30°C
   - CEILING_FAN: 0–5
   - WINDOW: "OPEN" or "CLOSED"
   - DOOR: "OPEN" or "CLOSED"
   - EXHAUST_FAN: "ON" or "OFF"

Output strictly in JSON format with this structure:
{{
  "reason": "text explaining key decisions",
  "AC_MODE": "COOL",
  "AC_TEMPERATURE": 23,
  "CEILING_FAN": 3,
  "WINDOW": "CLOSED",
  "DOOR": "CLOSED",
  "EXHAUST_FAN": "ON",
  "RECHECK_AT": provide number of minutes required to recheck once more
}}
"""

response = client.models.generate_content(
    model="gemini-2.5-flash",  # or gemini-2.0-flash when available
    contents=prompt,
    config={
        "response_mime_type": "application/json",
        "response_schema": ApplianceSettings,
    },
)

# Print structured JSON output
print(response.text)

# Or use directly as a Pydantic model instance
# settings: ApplianceSettings = response.parsed
# print(settings)






# import os
# import requests
# from dotenv import load_dotenv
# from google import genai
# from datetime import datetime
# import time

# load_dotenv()
# API_KEY = os.getenv('GEMINI_API_KEY')

# from enum import Enum
# from pydantic import BaseModel, Field

# # Define enums for fixed string choices
# class ACMode(str, Enum):
#     OFF = "OFF"
#     COOL = "COOL"
#     FAN = "FAN"

# class DoorWindowState(str, Enum):
#     OPEN = "OPEN"
#     CLOSED = "CLOSED"

# class ApplianceSettings(BaseModel):
#     reason: str
#     AC_MODE: ACMode
#     AC_TEMPERATURE: int = Field(ge=16, le=30, description="Valid range: 16-30°C")
#     CEILING_FAN: int = Field(ge=0, le=5, description="Valid speed: 0-5")
#     WINDOW: DoorWindowState
#     DOOR: DoorWindowState
#     RECHECK_AFTER:  int = Field(description="provide minutes to recheck the previous recommendations")
    


# from google import genai

# client = genai.Client(api_key=API_KEY)

# room_info = {"length": 5.0, "breadth": 4.0, "occupancy": 2}
# appliances = {"AC": True, "CEILING_FAN": True, "WINDOW": True, "DOOR": True}
# user_info = {"username": "John", "age": 28, "gender": "Male", "health_issues": ["asthma"]}
# pollutants = {  "temperature": 24,"humidity": 50,"co2": 600,"voc": 80,"pm2_5": 8,"pm10": 15,"timestamp": "2025-10-23 22:20:00","comfort_status": "stable",}

# prompt = f"""
# You are an intelligent indoor comfort and air-quality control system and a buddy of the user and talk in friendly manner who speaks extreme facts.

# Input data:
# - Room info: {room_info}
# - Appliances: {appliances}
# - User info: {user_info}
# - Pollutants: {pollutants}

# Goal:
# 1. Adjust appliance settings to increase comfort and reduce pollutants.
# 2. Explain briefly *why* each key change was made (or not needed).
# 3. Stay within valid ranges and allowed values:
#    - AC_MODE: "OFF", "COOL", "FAN"
#    - AC_TEMPERATURE: 16–30°C
#    - CEILING_FAN: 0–5
#    - WINDOW: "OPEN" or "CLOSED"
#    - DOOR: "OPEN" or "CLOSED"

# Output strictly in JSON format with this structure:
# {{
#   "reason": "text explaining key decisions",
#   "AC_MODE": "COOL",
#   "AC_TEMPERATURE": 23,
#   "CEILING_FAN": 3,
#   "WINDOW": "CLOSED",
#   "DOOR": "CLOSED",
#   "RECHECK_AT": provide number of minutes required to recheck once more
# }}
# """

# response = client.models.generate_content(
#     model="gemini-2.5-flash",  # or gemini-2.0-flash when available
#     contents=prompt,
#     config={
#         "response_mime_type": "application/json",
#         "response_schema": ApplianceSettings,
#     },
# )

# # Print structured JSON output
# print(response.text)

# # Or use directly as a Pydantic model instance
# # settings: ApplianceSettings = response.parsed
# # print(settings)
