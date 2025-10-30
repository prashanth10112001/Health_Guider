import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
client = genai.Client(api_key=API_KEY)

# 🧩 Tool functions
def get_normal_chat(user_input: str):
    return f"Hey you called normal chat. You said: '{user_input}'"

def get_recommendation(user_input: str):
    return f"Hey you called recommendation. You said: '{user_input}'"

# 🚀 Agentic AI async function
async def agentic_ai(user_input: str):
    """
    Routes user input to the correct function using Gemini 2.5 Flash.
    """

    system_prompt = """
    You are an intelligent AI router.
    You must decide whether to call get_normal_chat() or get_recommendation()
    based on the user's intent.

    Rules:
    - If the user asks about weather, general info, or chat topics → CALL_NORMAL_CHAT
    - If the user expresses discomfort, cold, illness, or not feeling well → CALL_RECOMMENDATION
    Return ONLY one of these: CALL_NORMAL_CHAT or CALL_RECOMMENDATION
    """

    # Combine everything into one prompt
    full_prompt = f"{system_prompt}\n\nUser: {user_input}"

    # Run Gemini call safely in a thread (non-blocking)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=full_prompt,
    )

    intent = (response.text or "").strip().upper()

    # Route based on Gemini's classification
    if "RECOMMENDATION" in intent:
        return get_recommendation(user_input)
    else:
        return get_normal_chat(user_input)

# 🧪 Test runner
async def main():
    while True:
        user_input = input("\n🧍 User: ")
        if user_input.lower() in {"exit", "quit"}:
            break
        result = await agentic_ai(user_input)
        print(f"🤖 Agent: {result}")

if __name__ == "__main__":
    asyncio.run(main())
