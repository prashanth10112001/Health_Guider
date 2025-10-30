# # python_services/agent_client.py
# import os
# import asyncio
# from google import genai
# from dotenv import load_dotenv

# load_dotenv()
# API_KEY = os.getenv("GEMINI_API_KEY")

# if not API_KEY:
#     raise ValueError("Missing GEMINI_API_KEY in .env file")

# # Initialize Gemini client
# client = genai.Client(api_key=API_KEY)

# # ----------------------------
# # 🧩 Tool functions
# # ----------------------------
# async def get_normal_chat(user_input: str):
#     """
#     Generate a conversational response using Gemini.
#     Focus strictly on environmental topics: weather, pollutants, and health effects.
#     If unrelated, politely decline.
#     """

#     chat_prompt = f"""
#     You are an expert environmental and health assistant.
#     Your domain of knowledge includes:
#     - Weather and air quality
#     - Pollutants (PM2.5, CO2, NOx, etc.)
#     - Effects of pollution on health
#     - Recommendations for staying healthy in polluted environments
#     - General environmental awareness and comfort improvement tips

#     Rules:
#     - If the user's question or statement relates to these topics, reply normally.
#     - If it is outside these topics (like sports, tech, random jokes, etc.), respond briefly:
#       "Sorry, I can only answer questions related to weather, pollution, or health impacts."

#     Keep replies short (1–2 sentences), conversational, and empathetic.
    
#     User: {user_input}
#     """

#     # Run Gemini call asynchronously in a thread (non-blocking)
#     response = await asyncio.to_thread(
#         client.models.generate_content,
#         model="gemini-2.5-flash",
#         contents=chat_prompt
#     )

#     ai_reply = response.text.strip() if response.text else (
#         "Sorry, I can only answer questions related to weather, pollution, or health impacts."
#     )

#     return {
#         "type": "chat",
#         "message": ai_reply,
#     }


# def get_recommendation(user_input: str):
#     return {
#         "type": "recommendation",
#         "message": f"Hey you called recommendation. You said: '{user_input}'"
#     }

# # ----------------------------
# # 🧠 Agentic AI logic
# # ----------------------------
# async def get_agentic_response(user_input: str):
#     """
#     Determines whether the user input requires normal chat or a recommendation.
#     Uses Gemini 2.5 Flash model to classify intent.
#     """

#     system_prompt = """
#     You are an intelligent AI router.
#     You must decide whether to call get_normal_chat() or get_recommendation()
#     based on the user's intent.

#     Rules:
#     - If the user asks about weather, general info, or chat topics → CALL_NORMAL_CHAT
#     - If the user expresses discomfort, cold, illness, or not feeling well → CALL_RECOMMENDATION
#     Return ONLY one of these: CALL_NORMAL_CHAT or CALL_RECOMMENDATION
#     """

#     full_prompt = f"{system_prompt}\n\nUser: {user_input}"

#     # Gemini call (in a thread to avoid blocking FastAPI)
#     response = await asyncio.to_thread(
#         client.models.generate_content,
#         model="gemini-2.5-flash",
#         contents=full_prompt
#     )

#     intent = (response.text or "").strip().upper()

#     if "RECOMMENDATION" in intent:
#         return get_recommendation(user_input)
#     else:
#         return await get_normal_chat(user_input)



import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env file")

# Initialize Gemini client
client = genai.Client(api_key=API_KEY)

# ----------------------------
# 🧩 Tool functions
# ----------------------------
async def get_normal_chat(user_input: str):
    """
    Generate a conversational response using Gemini.
    Focus on weather, pollution, and health-related topics — but also handle greetings politely.
    """

    chat_prompt = f"""
    You are a friendly and knowledgeable environmental and health assistant.
    You specialize in:
    - Weather and air quality
    - Pollutants (PM2.5, CO2, NOx, etc.)
    - Health effects of pollution and poor air quality
    - Ways to stay healthy and comfortable in polluted environments

    Behavior guidelines:
    1. If the user greets you (like "hi", "hello", "hey", "good morning"), respond with a friendly short greeting and invite them to ask about weather, air quality, or health.
    2. If the user asks general questions about weather, air, or pollution, respond naturally and informatively.
    3. If the question is unrelated (like math, technology, sports, jokes, etc.), respond with:
       "Sorry, I can only answer questions related to weather, pollution, or health impacts."
    4. Keep responses concise (1–2 sentences) and empathetic.

    User: {user_input}
    """

    # Run Gemini call asynchronously in a thread (non-blocking)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=chat_prompt
    )

    ai_reply = response.text.strip() if response.text else (
        "Sorry, I can only answer questions related to weather, pollution, or health impacts."
    )

    return {
        "type": "chat",
        "message": ai_reply,
    }



def get_recommendation(user_input: str):
    return {
        "type": "recommendation",
        "message": f"Hey you called recommendation. You said: '{user_input}'"
    }

# ----------------------------
# 🧠 Agentic AI logic
# ----------------------------
async def get_agentic_response(user_input: str):
    """
    Determines whether the user input requires normal chat or a recommendation.
    Uses Gemini 2.5 Flash model to classify intent.
    """

    system_prompt = """
        You are an intelligent intent classifier for an environmental health assistant.

        Your job is to decide whether to call:
        - CALL_NORMAL_CHAT → for general questions, greetings, or informational topics
        (like weather, air quality, pollution, health improvement, or environment)
        - CALL_RECOMMENDATION → only if the user expresses physical discomfort or illness
        (e.g., "I feel dizzy", "I have a headache", "my room feels suffocating")

        Rules:
        1. If the user is simply greeting or asking for advice on health, air, or pollution — CALL_NORMAL_CHAT.
        2. If the user mentions feeling unwell, cold, tired, or sick — CALL_RECOMMENDATION.
        3. Always respond with exactly one of these two words:
        - CALL_NORMAL_CHAT
        - CALL_RECOMMENDATION
        """


    full_prompt = f"{system_prompt}\n\nUser: {user_input}"

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=full_prompt
    )

    intent = (response.text or "").strip().upper()

    if "RECOMMENDATION" in intent:
        return get_recommendation(user_input)
    else:
        return await get_normal_chat(user_input)
