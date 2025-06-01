# /apps/api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import os
from dotenv import load_dotenv
from google import genai
import json
from fastapi import HTTPException

import logging
# Configure logging
logging.basicConfig(level=logging.INFO)

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

PROMPT_TEMPLATE = """
You are "Aura," an expert data scientist specializing in personal informatics and well-being. Your task is to analyze a JSON array of daily emotional and energetic check-ins from a user. Your goal is to identify meaningful, actionable, and non-obvious patterns, correlations, and trends over time.

**Your Task:**
Analyze the following JSON data. Your response MUST be in Markdown and STRICTLY follow this structure:

### Your Aura Report: Insights from the Past {X} Days

**Overall Trend:**
* Briefly describe the general trend of mood and energy over the period. Is it stable, improving, declining? Mention any weekly cycles (e.g., "weekend boost").

**Key Correlations We've Found:**
* Identify up to 3 strong positive or negative correlations. Be specific.
* Example Positive: "There is a strong link between days tagged 'exercise' and a higher mood score the next day."
* Example Negative: "Days following a 'poor-sleep' tag consistently show a 3-point drop in energy."

**Trigger Pattern Identified:**
* Look for sequences. Does a specific event or tag consistently lead to a negative outcome 1-2 days later?
* Example: "On 3 out of 4 occasions where your notes mentioned 'deadline', your mood dropped significantly on that day."

**Recurring Theme:**
* Analyze the text in the 'note' field. Are there recurring words or concepts? (e.g., "lonely," "procrastination," "unappreciated").

**Your Emotional Weather Forecast:**
* Based on the patterns, provide one forward-looking, actionable piece of advice. It should be proactive, not reactive.
* Example: "Given the consistent mood dip on Wednesdays, consider scheduling a non-work related, enjoyable activity on Tuesday evenings."

**Data Provided:**
\"\"\"
{jsonData}
\"\"\"
"""

@app.post("/api/v1/analyze-patterns")
async def analyze_patterns(request: AnalysisRequest):
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        logging.error("GEMINI_API_KEY not found in environment variables")
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not found")
    if not request.entries:
        logging.error("No entries provided for analysis")
        raise HTTPException(status_code=400, detail="No entries provided for analysis")
    
    try:
        # Configure Gemini
        # Explicitly configure the Gemini API key
        client = genai.Client(api_key=gemini_api_key)
        # Log the API key usage
        logging.info("Using Gemini API key for analysis")
        # Log the number of entries being analyzed
        logging.info(f"Analyzing {len(request.entries)} entries")
        if not request.entries:
            raise HTTPException(status_code=400, detail="No entries provided for analysis")
        
        # Convert entries to JSON for the prompt
        entries_json = json.dumps([entry.model_dump() for entry in request.entries], indent=2)
        days_count = len(request.entries)
        if days_count == 0:
            raise HTTPException(status_code=400, detail="No entries provided for analysis")
        
        # Format the prompt
        prompt = PROMPT_TEMPLATE.replace("{jsonData}", entries_json).replace("{X}", str(days_count))
        
        # Generate content using Gemini
        logging.info("Generating content with Gemini")
        try:
            response = client.models.generate_content(
                model="models/gemini-2.5-flash-preview-05-20",
                contents=prompt,
            )
        except Exception as e:
            logging.error(f"Error generating content with Gemini: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generating content with Gemini") 
        
        return {
            "analysis": response.text,
            "entries_analyzed": len(request.entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")