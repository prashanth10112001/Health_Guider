import os
import time
import threading
import json
from datetime import datetime
from dotenv import load_dotenv
from typing import Optional
from pydantic import BaseModel, Field, ValidationError
from flask import Flask, render_template, jsonify, request

# Gemini client import (use the same import style you've used before)
# If your environment has a different import (e.g. google_genai or openai-like), adapt accordingly.
from google import genai

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Please set GEMINI_API_KEY in your .env file")

client = genai.Client(api_key=API_KEY)

# -------------------------
# Pydantic Schema (same as you used)
# -------------------------
class ACMode(str):
    OFF = "OFF"
    COOL = "COOL"
    FAN = "FAN"

class DoorWindowState(str):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class ExhaustFanState(str):
    ON = "ON"
    OFF = "OFF"

class ApplianceSettings(BaseModel):
    reason: str
    AC_MODE: str
    AC_TEMPERATURE: int = Field(ge=16, le=30)
    CEILING_FAN: int = Field(ge=0, le=5)
    WINDOW: str
    DOOR: str
    EXHAUST_FAN: str
    RECHECK_AT: int

# -------------------------
# Shared State (thread-safe)
# -------------------------
state_lock = threading.Lock()
shared_state = {
    "latest_recommendation": None,  # ApplianceSettings dict
    "pollutants": {                 # example sensor snapshot; in real-world, get from sensors
        "temperature": 35,
        "humidity": 65,
        "co2": 5000,
        "voc": 120,
        "pm2_5": 45,
        "pm10": 70,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
    },
    "last_updated": None,
    "status": "idle",
    "error": None
}

# -------------------------
# Gemini Prompt Builder
# -------------------------
def build_gemini_prompt(room_info, appliances, user_info, pollutants):
    prompt = f"""
You are an intelligent indoor comfort and air-quality control system.

Input data:
- Room info: {room_info}
- Appliances: {appliances}
- User info: {user_info}
- Pollutants: {pollutants}

Goal:
1. Adjust appliance settings to increase comfort and reduce pollutants.
2. Explain briefly why each key change was made (or not needed).
3. Stay within valid ranges and allowed values:
   - AC_MODE: "OFF", "COOL", "FAN"
   - AC_TEMPERATURE: 16–30°C
   - CEILING_FAN: 0–5
   - WINDOW: "OPEN" or "CLOSED"
   - DOOR: "OPEN" or "CLOSED"
   - EXHAUST_FAN: "ON" or "OFF"

Output strictly in JSON format with this structure:
{{
  "reason": "text explaining key decisions in 30 words",
  "AC_MODE": "COOL",
  "AC_TEMPERATURE": 23,
  "CEILING_FAN": 3,
  "WINDOW": "CLOSED",
  "DOOR": "CLOSED",
  "EXHAUST_FAN": "ON",
  "RECHECK_AT": 5
}}
"""
    return prompt

# -------------------------
# Gemini call + validate
# -------------------------
def call_gemini_for_recommendation():
    # Build contextual inputs
    room_info = {"length": 5.0, "breadth": 4.0, "occupancy": 2}
    appliances = {"AC": True, "CEILING_FAN": True, "EXHAUST_FAN": True, "WINDOW": True, "DOOR": True}
    user_info = {"username": "John", "age": 28, "gender": "Male", "health_issues": ["asthma"]}
    pollutants = shared_state["pollutants"]

    prompt = build_gemini_prompt(room_info, appliances, user_info, pollutants)

    try:
        # Use the same call pattern you used previously
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                # Some SDKs accept a 'response_schema' param — we will parse manually for portability
            },
        )

        print(response)
        # The exact property holding text may vary between SDK versions; try .text then .content
        raw_text = getattr(response, "text", None) or getattr(response, "content", None) or str(response)
        # If response is bytes or object, convert to string
        if not isinstance(raw_text, str):
            raw_text = json.dumps(raw_text)

        # Sometimes the model may include extra text. Try to parse first JSON object found.
        parsed_json = extract_first_json(raw_text)

        # Validate with pydantic
        validated = ApplianceSettings.parse_obj(parsed_json)

        return validated.dict()

    except ValidationError as ve:
        print("[Gemini ValidationError]", ve)
        return None
    except Exception as e:
        print("[Gemini Error]", e)
        return None

def extract_first_json(text: str):
    import json
    # Try to parse the full text first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: extract first {...} using a simple non-greedy regex
        import re
        match = re.search(r'\{.*?\}', text, flags=re.DOTALL)
        if match:
            return json.loads(match.group())
        else:
            raise ValueError("No JSON content found")


# -------------------------
# Background worker loop
# -------------------------
RECOMMEND_INTERVAL_SECONDS = 120  # run every 1 minute as requested

def recommendation_worker():
    print("[Worker] Recommendation worker started. Polling every", RECOMMEND_INTERVAL_SECONDS, "seconds.")
    while True:
        with state_lock:
            shared_state["status"] = "generating"
            shared_state["error"] = None
        rec = call_gemini_for_recommendation()

        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        if rec:
            with state_lock:
                shared_state["latest_recommendation"] = rec
                shared_state["last_updated"] = now
                shared_state["status"] = "idle"
            print(f"[Worker] New recommendation at {now} ->", json.dumps(rec))
        else:
            with state_lock:
                shared_state["status"] = "idle"
                shared_state["error"] = f"Failed to get recommendation at {now}"
            print(f"[Worker] Failed to get recommendation at {now}. Keeping previous recommendation.")

        time.sleep(RECOMMEND_INTERVAL_SECONDS)

# -------------------------
# Flask App: UI + API
# -------------------------
app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/latest", methods=["GET"])
def api_latest():
    with state_lock:
        return jsonify({
            "latest_recommendation": shared_state["latest_recommendation"],
            "pollutants": shared_state["pollutants"],
            "last_updated": shared_state["last_updated"],
            "status": shared_state["status"],
            "error": shared_state["error"],
        })

@app.route("/api/chat", methods=["POST"])
def api_chat():
    """
    Accepts: {"message": "text from user"}
    Returns: {"reply": "..."}
    This chat uses Gemini in a simple, prompt-based way and includes the latest recommendation for context.
    """
    data = request.json or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "message required"}), 400

    # Compose a chat prompt that includes current state
    with state_lock:
        latest = shared_state["latest_recommendation"]
        pollutants = shared_state["pollutants"]
        last_updated = shared_state["last_updated"]

    chat_prompt = f"""
You are a helpful indoor air-quality assistant. A user just said:
\"\"\"{message}\"\"\"

Latest sensor snapshot: {pollutants} (last_updated: {last_updated})
Latest recommendation: {latest}

Answer conversationally, referencing the latest recommendation and sensors when useful.
If the user asks to change settings, suggest what to change but do NOT actually change anything unless explicitly requested via an API call.
"""

    try:
        resp = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=chat_prompt,
            config={"response_mime_type": "text/plain"},
        )
        reply_text = getattr(resp, "text", None) or str(resp)
    except Exception as e:
        reply_text = "Sorry — I couldn't contact the recommendation engine right now."

    return jsonify({"reply": reply_text})

# -------------------------
# Start worker thread before running Flask
# -------------------------
def start_background_worker():
    t = threading.Thread(target=recommendation_worker, daemon=True)
    t.start()

if __name__ == "__main__":
    start_background_worker()
    app.run(host="0.0.0.0", port=5000, debug=True)
