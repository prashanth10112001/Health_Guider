# python_services/app.py
import os
import json
import uvicorn
import asyncio
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from ai_client import get_ai_recommendation
from data_samples import prepare_environment_data
from prompt_builder import build_prompt
from agent_client import get_agentic_response


# ✅ Create the FastAPI app
app = FastAPI(title="Indoor Comfort AI Service", version="1.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",  # Node backend
        "http://127.0.0.1:4000",
        "http://localhost:5173",  # Frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🧠 Request schema
class RecommendationRequest(BaseModel):
    user: dict
    room: dict
    indoor: dict | None = None
    outdoor: dict | None = None
    meta: dict | None = None

class AgentChatRequest(BaseModel):
    user_input: str


@app.post("/ai/recommend")
async def get_ai_recommendation_route(request: RecommendationRequest):
    try:
        # Normalize the data
        room_info, appliances, user_info, indoor_pollutants, outdoor_pollutants = prepare_environment_data(
            request.user,
            request.room,
            request.indoor,
            request.outdoor
        )

        # Build prompt
        prompt = build_prompt(
            room_info=room_info,
            appliances=appliances,
            user_info=user_info,
            indoor_pollutants=indoor_pollutants,
            outdoor_pollutants=outdoor_pollutants
        )


        # Send to Gemini
        # ai_response = await get_ai_recommendation(prompt,appliances)
        ai_response = await run_in_threadpool(get_ai_recommendation, prompt, appliances)
        if not ai_response:
            raise HTTPException(status_code=500, detail="AI service returned no response")
        
        try:
            ai_data = json.loads(ai_response)
        except json.JSONDecodeError:
            ai_data = ai_response  # fallback if already dict


        return {"success": True, "recommendation": ai_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/agent")
async def handle_agent_chat(request: AgentChatRequest):
    """
    Route incoming user chat messages to Gemini AI router.
    """
    try:
        result = await get_agentic_response(request.user_input)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Local dev entry
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
