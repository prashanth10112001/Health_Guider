# python_services/ai_client.py
import os
from dotenv import load_dotenv
from google import genai
from schemas import create_appliance_schema

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env file")

# Initialize the Gemini client
client = genai.Client(api_key=API_KEY)

def get_ai_recommendation(prompt: str, appliances: dict):
    """
    Send prompt to Gemini and return structured JSON response.
    Schema is dynamically generated based on available appliances.
    """
    try:
        # Dynamically create schema for this user
        ApplianceSettings = create_appliance_schema(appliances)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ApplianceSettings,
            },
        )
        return response.text
    except Exception as e:
        print("AI Recommendation Error:", e)
        return None
