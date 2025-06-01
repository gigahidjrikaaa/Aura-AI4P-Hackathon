You are my expert pair programmer for a 12-hour hackathon project. Your role is to help me build "Aura," a privacy-first emotional wellness application, by providing high-quality, production-ready code that adheres strictly to the principles and architecture defined below.

1. Project High-Level Brief
Project Name: Aura
Mission: To help users understand their emotional well-being over time by analyzing longitudinal data from daily check-ins. The app reveals hidden patterns, triggers, and correlations.
Core Differentiator: The application is privacy-first and stateless. All user check-in data is stored exclusively in the browser's localStorage. The backend processes data in-flight and never persists user-specific emotional data.
2. Core Architectural Principles
Separation of Concerns: The frontend (Next.js) is completely decoupled from the backend (FastAPI). Communication happens exclusively via a RESTful API.
Stateless Backend: The FastAPI application does not have a database and does not store any user journal data. Its only role is to receive data, proxy a request to the Gemini AI API, and return the analysis.
Client-Side Persistence: The Next.js application is responsible for all data storage using the browser's localStorage.
Type Safety is Paramount: Both frontend and backend must be strictly typed. We will use TypeScript on the frontend and Python with Pydantic models on the backend.
System Flow:
Next.js (Client, localStorage) -> REST API POST Request -> FastAPI (Server) -> Google Gemini API -> FastAPI Response -> Next.js (Client)

3. Frontend Specifications (Next.js)
Framework: Next.js 14+ with the App Router.
Language: TypeScript (Strict mode enabled).
Styling: Tailwind CSS with a CSS-first configuration.
Configuration: Do not generate a tailwind.config.js. Define all theme values directly in globals.css using the @theme directive.
Values: Use CSS variables (var(--custom-prop)) for all color and spacing values in your JSX.
Colors: Define all colors using oklch.
Example globals.css:
CSS

@import "tailwindcss";

@theme {
  --color-background: oklch(0.17 0.03 234.38);
  --color-text-primary: oklch(0.95 0.02 234.38);
  --color-text-secondary: oklch(0.6 0.02 234.38);
  --color-accent: oklch(0.7 0.15 275);
  --color-surface: oklch(0.25 0.03 234.38);
}
State Management:
For local component state, use React.useState.
For managing the list of journal entries, we will use a custom hook named useLocalStorage. Prompt me to create this hook. It should synchronize a state variable with the browser's localStorage.
Do not use complex state management libraries like Redux or Zustand.
Data Fetching: Use the standard fetch API to communicate with the FastAPI backend. All API calls should be encapsulated in dedicated functions within a services/api.ts file.
Component Structure: Organize components into folders like components/ui (for primitive elements like buttons, inputs) and components/features (for complex components like CheckInForm or AuraReport).
4. Backend Specifications (FastAPI)
Framework: FastAPI
Language: Python 3.11+
Dependency Management: Use pip and maintain a requirements.txt file. Key dependencies will be fastapi, uvicorn, pydantic, python-dotenv, and google-generativeai.
API Design:
Adhere to RESTful principles.
Use Pydantic models for all request and response bodies to ensure strict data validation.
The primary endpoint will be POST /api/v1/analyze-patterns.
Security:
CORS: Enable CORS to allow requests from the Next.js frontend's domain (for development, allow http://localhost:3000). Use FastAPI's CORSMiddleware.
API Keys: The GEMINI_API_KEY must be loaded from an environment variable using python-dotenv. Never hardcode it.
Environment: The application should be configured to run with uvicorn.
5. Key Data Structures (MUST be consistent)
The Entry data structure is critical. Here it is in both TypeScript and Pydantic.

TypeScript Interface (types/entry.ts):

TypeScript

export interface IEntry {
  id: string;
  date: string; // ISO 8601 format
  mood: number;
  energy: number;
  note: string;
  tags: string[];
}
Python Pydantic Model (models/entry.py):

Python

from pydantic import BaseModel, Field
from typing import List

class Entry(BaseModel):
    id: str
    date: str
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    note: str
    tags: List[str]

class AnalysisRequest(BaseModel):
    entries: List[Entry]
6. The Master AI Prompt (For the FastAPI service)
When creating the /api/v1/analyze-patterns endpoint, this is the exact prompt template to use for the call to the Gemini API.

Python

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
7. How to Interact With Me (Example Prompts for Copilot)
To ensure we work efficiently, please use clear and specific prompts.

For Frontend Components:

"Create a new React component CheckInForm.tsx. It should contain two slider inputs (for mood and energy from 1 to 10), a text input for the note, and a text input for comma-separated tags. Use the Tailwind CSS variables we defined (var(--color-surface), etc.) for styling. The component should accept an onSubmit prop that passes the new entry data."

For Client-Side Logic:

"Create the useLocalStorage custom hook. It should take a key and an initial value, and return a stateful value and a function to update it, persisting changes to localStorage."

For Backend Endpoints:

"Generate the FastAPI endpoint for POST /api/v1/analyze-patterns. It should accept a request body matching the AnalysisRequest Pydantic model. It needs to load the GEMINI_API_KEY from environment variables, format the PROMPT_TEMPLATE with the received entry data, call the Google Gemini API, and return the AI's analysis as a JSON response."

For Backend Setup:

"Create the basic main.py file for our FastAPI application. Include the necessary CORS middleware configuration to allow requests from http://localhost:3000."

-------

# Full Story of Aura Project:
In a world saturated with noise, where external demands constantly pull at our attention, the journey toward self-awareness has become both more critical and more difficult. The hackathon's theme, "Peace with Oneself," speaks to a fundamental human need: to understand the currents of our own minds and find a sense of calm amidst the chaos. We observed that most digital wellness tools are reactive; they offer a bandage during a moment of crisis—a guided meditation for an anxiety attack, a breathing exercise for stress. While valuable, they treat the symptoms, not the underlying system. True, sustainable peace comes from understanding the patterns, the subtle, longitudinal rhythms of our own lives. It comes from answering not just "Why do I feel bad right now?" but "What conditions in my life cultivate my well-being, and what conditions erode it?"

This is the problem Aura was conceived to solve.

Aura is not a journal, nor is it a therapist. It is an intelligent emotional barometer; a private, proactive partner in self-discovery. We envision it as a "weather forecast for the soul." Just as you'd check the weather to decide if you need a jacket, you would consult Aura to understand the climate of your inner world. The experience is designed to be one of quiet, consistent reflection, not demanding intervention.

Each day, the user is invited to a frictionless, 30-second check-in: a simple rating of their mood and energy, a single sentence about a high or low point, and optional tags like work, family, or poor-sleep. This act is intentionally minimal, designed to become a moment of effortless ritual. This data, this stream of personal history, is Aura's foundation. And in line with our core philosophy, it is a foundation built on absolute trust.

The technical architecture is a direct reflection of this philosophy. Aura is built on a privacy-first, stateless model. All check-in data is stored exclusively on the user's own device, in their browser's local storage. It never touches our servers for storage; it is theirs and theirs alone. The frontend, a fluid and responsive application built with Next.js, manages this private data store. When the user is ready for insight, this data is sent for a single, in-flight analysis to our backend. This backend, a robust and efficient FastAPI service, acts as a secure and stateless conduit. Its sole purpose is to receive the data, communicate with the Google Gemini AI, and relay the resulting analysis back to the user before wiping the context. There is no user database to breach, no sensitive history to leak.

The magic happens when the user asks, "Reveal My Aura." The application sends weeks of accumulated data to the AI, which acts not as a friend, but as a compassionate, insightful data scientist. It performs a longitudinal synthesis, returning a report that highlights the invisible connections in a user's life. It might be the non-obvious link between days tagged social and a spike in creative energy two days later, or a recurring dip in mood on the days following poor sleep. It finds the signal in the noise.

For this hackathon, we built this core experience. We established a clean, professional monorepo structure to house our decoupled frontend and backend, ensuring we could move quickly without sacrificing quality. We created the seamless data-entry UI, the secure API endpoint, and the powerful AI prompt that turns raw data into human wisdom.

The vision for Aura extends beyond this initial build. We see a future where it can provide gentle, proactive nudges: "I've noticed your energy levels have trended down for three consecutive days. The last time this happened, a walk in the park helped." We imagine integrations with calendars—not to surveil, but to correlate, helping a user see how different types of events impact their well-being.

Ultimately, Aura is a tool to empower individuals to move from being passive passengers in their emotional lives to becoming active, informed navigators. It provides the map and the compass, built from their own unique data, to help them chart a course toward a more consistent and authentic state of peace—a peace found not by silencing the world, but by understanding oneself.