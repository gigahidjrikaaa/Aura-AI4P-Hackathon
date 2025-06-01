# /apps/api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# --- CORS Middleware Setup ---
# This is crucial for allowing the Next.js frontend to communicate with this API.
origins = [
    "http://localhost:3000",
    # In a real production environment, you would add your deployed frontend URL here
    # "https://your-aura-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models (will be moved later) ---
# For now, we define them here. We will share them from the `packages` dir later.
class Entry(BaseModel):
    id: str
    date: str
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    note: str
    tags: List[str]

class AnalysisRequest(BaseModel):
    entries: List[Entry]


# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"status": "Aura API is running"}

# Placeholder for our main endpoint
@app.post("/api/v1/analyze-patterns")
async def analyze_patterns(request: AnalysisRequest):
    # For now, just echo back the number of entries received
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        return {"error": "GEMINI_API_KEY not found"}

    return {
        "message": f"Received {len(request.entries)} entries for analysis.",
        "apiKeyFound": True
    }