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
    "https://aura-ai4p-hackathon-backend.onrender.com",
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

ENHANCED_PROMPT_TEMPLATE = """
You are "Aura," an expert data scientist specializing in personal informatics and well-being. Your task is to analyze emotional patterns and provide predictive insights.

**Your Enhanced Analysis:**

### Your Aura Report: Insights from the Past {X} Days

**Emotional Weather Forecast (Next 7 Days):**
* Based on detected patterns, predict mood/energy trends for each day next week
* Include confidence levels (High/Medium/Low) for each prediction
* Example: "Tuesday: Predicted mood dip (High confidence) - historical pattern shows 80% likelihood"

**Pattern Strength Analysis:**
* Rate each discovered pattern from 1-10 based on consistency and predictive power
* Highlight your strongest behavioral patterns that could be leveraged

**Personalized Intervention Recommendations:**
* Suggest specific, actionable micro-interventions based on upcoming predicted dips
* Include timing recommendations (e.g., "Schedule 15min nature walk Monday 2pm")

**Risk & Opportunity Windows:**
* Identify upcoming 48-72 hour periods of vulnerability or peak performance
* Provide specific strategies for each window

**Data Provided:**
\"\"\"
{jsonData}
\"\"\"
"""

TRAUMA_AWARE_PROMPT_TEMPLATE = """
You are "Aura," an expert trauma-informed data scientist specializing in emotional healing and self-discovery. Your task is to analyze emotional patterns with particular attention to identifying unresolved trauma, childhood wounds, and repetitive cycles that prevent inner peace.

**Your Enhanced Trauma-Aware Analysis:**

### Your Aura Report: Path to Inner Peace - Insights from {X} Days

**Emotional Wound Pattern Recognition:**
* Identify recurring emotional triggers that may stem from unresolved trauma
* Look for avoidance patterns, anger cycles, or self-neglect behaviors
* Flag potential childhood wound manifestations (abandonment, criticism sensitivity, perfectionism)
* Example: "Your data shows a consistent anxiety spike when tagged 'authority figures' - this may indicate unresolved childhood authority wound"

**Trauma Response Identification:**
* Detect fight/flight/freeze responses in daily patterns
* Identify emotional dysregulation windows
* Recognize self-sabotage or avoidance behaviors
* Example: "Pattern detected: mood drops 24-48 hours before social events, suggesting social anxiety rooted in rejection sensitivity"

**Healing Opportunity Windows:**
* Identify moments of emotional resilience and strength
* Highlight self-compassion successes
* Detect breakthrough moments and recovery patterns
* Example: "Your recovery time from emotional dips has decreased by 40% - evidence of growing emotional resilience"

**Personalized Healing Recommendations:**
* Suggest specific trauma-informed interventions based on detected patterns
* Provide timing for optimal healing work
* Recommend grounding techniques for identified triggers
* Example: "When 'overwhelm' tags appear, implement 5-4-3-2-1 grounding technique within 30 minutes for optimal regulation"

**Inner Peace Forecast:**
* Predict upcoming emotional vulnerability windows
* Suggest proactive self-care timing
* Identify optimal moments for deeper healing work
* Example: "Next Tuesday shows high vulnerability - schedule gentle self-care and avoid challenging conversations"

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
        client = genai.Client(api_key=gemini_api_key)
        logging.info(f"Analyzing {len(request.entries)} entries with trauma-informed approach")
        
        # Convert entries to JSON for the prompt
        entries_json = json.dumps([entry.model_dump() for entry in request.entries], indent=2)
        days_count = len(request.entries)
        
        # Use the trauma-aware prompt for deeper insights
        prompt = TRAUMA_AWARE_PROMPT_TEMPLATE.replace("{jsonData}", entries_json).replace("{X}", str(days_count))
        
        # Generate content using Gemini
        logging.info("Generating trauma-informed content with Gemini")
        response = client.models.generate_content(
            model="models/gemini-2.5-flash-preview-05-20",
            contents=prompt,
        )
        
        return {
            "analysis": response.text,
            "entries_analyzed": len(request.entries),
            "analysis_type": "trauma_informed"
        }
        
    except Exception as e:
        logging.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")