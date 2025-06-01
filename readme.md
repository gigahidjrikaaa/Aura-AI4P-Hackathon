# Aura: Emotional Intelligence Through AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab)](https://www.python.org/)

> *Peace with Oneself Through Data-Driven Self-Discovery*

Aura is a privacy-first emotional wellness application that helps users understand their emotional well-being through longitudinal data analysis. Built for the AI4P Hackathon with the theme "Peace with Oneself," Aura transforms daily emotional check-ins into meaningful insights using advanced AI pattern recognition.

> Try it live: [Aura Demo](https://aura-ai4p-hackathon-backend.onrender.com)

## 🌟 Key Features

### Privacy-First Architecture

- **Zero Server-Side Data Storage**: All emotional data remains in your browser's localStorage
- **Stateless Backend**: API processes data in-flight without persistence
- **Local Data Ownership**: Complete control over your personal information

### Progressive User Journey

- **Newcomer Stage**: Simple daily check-ins with mood and energy tracking
- **Explorer Stage**: Pattern recognition and basic insights
- **Tracker Stage**: Momentum indicators and smart interventions
- **Analyzer Stage**: Advanced pattern strength analysis
- **Master Stage**: Expert Mode with correlation matrices and forecasting models

### AI-Powered Insights

- **Trauma-Informed Analysis**: Specialized prompts for identifying emotional patterns and healing opportunities
- **Pattern Recognition**: Detects correlations between activities, moods, and energy levels
- **Predictive Forecasting**: Multiple mathematical models for emotional trend prediction
- **Confidence Scoring**: Statistical reliability analysis for detected patterns

### Advanced Analytics (Expert Mode)

- **Correlation Matrix**: Statistical relationships between mood, energy, and activities
- **Pattern Confidence Scoring**: Reliability analysis with excellent/good/moderate/poor ratings
- **Advanced Forecasting**: Linear, seasonal, tag-based, and volatility-adjusted prediction models
- **Data Export Tools**: Complete data sovereignty with export capabilities

## 🏗️ Architecture

### System Design Principles

1. **Separation of Concerns**: Complete decoupling between frontend and backend
2. **Stateless Backend**: No user data persistence on server side
3. **Client-Side Persistence**: Browser localStorage as single source of truth
4. **Type Safety**: Strict TypeScript frontend, Pydantic backend validation

### Technology Stack

**Frontend (Next.js)**

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with CSS-first configuration
- **State Management**: React hooks + custom `useLocalStorage` hook
- **UI/UX**: Glass morphism design with cosmic theme
- **Notifications**: React Hot Toast for user feedback

**Backend (FastAPI)**

- **Framework**: FastAPI 0.115.12
- **Language**: Python 3.11+
- **AI Integration**: Google Gemini API for pattern analysis
- **Validation**: Pydantic models for request/response validation
- **CORS**: Configured for Next.js frontend communication

### Data Flow

```
Next.js Client (localStorage) → REST API → FastAPI → Google Gemini → Analysis Response → Client
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** (frontend)
- **Python** 3.11+ and **pip** (backend)
- **Google Gemini API Key** (for AI analysis)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Aura-AI4P-Hackathon.git
   cd Aura-AI4P-Hackathon
   ```

2. **Frontend Setup**

   ```bash
   cd apps/frontend
   pnpm install
   ```

3. **Backend Setup**

   ```bash
   cd apps/api
   pip install -r requirements.txt
   ```

4. **Environment Configuration**

   Create `apps/api/.env`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Development

**Start the backend server:**

```bash
cd apps/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Start the frontend development server:**

```bash
cd apps/frontend
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## 📊 Data Structures

### Core Entry Model

**TypeScript Interface:**

```typescript
interface IEntry {
  id: string;
  date: string; // ISO 8601 format
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  note: string;
  tags: string[];
}
```

**Python Pydantic Model:**

```python
class Entry(BaseModel):
    id: str
    date: str
    mood: int = Field(..., ge=1, le=10)
    energy: int = Field(..., ge=1, le=10)
    note: str
    tags: List[str]
```

## 🧠 AI Analysis System

### Trauma-Informed Approach

Aura uses specialized AI prompts designed for trauma-informed emotional analysis:

- **Emotional Wound Pattern Recognition**: Identifies recurring triggers and trauma responses
- **Healing Opportunity Windows**: Detects moments of resilience and growth
- **Personalized Intervention Recommendations**: Suggests specific, timing-aware interventions
- **Inner Peace Forecasting**: Predicts emotional vulnerability windows

### Analysis Confidence Levels

- **Excellent (80%+)**: Very reliable pattern with strong statistical backing
- **Good (60-79%)**: Reliable pattern with some uncertainty
- **Moderate (40-59%)**: Pattern exists but needs more data
- **Poor (<40%)**: Weak or unreliable pattern

## 🎯 User Journey Stages

### Progressive Feature Disclosure

| Stage | Entries Required | Unlocked Features |
|-------|------------------|-------------------|
| **Newcomer** | 0 | Daily check-ins, basic UI |
| **Explorer** | 1-2 | Daily healing features, smart interventions |
| **Tracker** | 3-6 | Momentum indicators, pattern analysis |
| **Analyzer** | 7-13 | Pattern strength, emotional forecasting |
| **Master** | 14+ | Expert Mode with advanced analytics |

## 🔧 Development Guidelines

### Frontend Standards

**Component Organization:**

```
src/
├── components/
│   ├── ui/           # Primitive components (buttons, inputs)
│   └── features/     # Complex components (CheckInForm, AuraReport)
├── hooks/            # Custom React hooks
├── services/         # API communication layer
├── types/            # TypeScript type definitions
└── app/              # Next.js App Router pages
```

**Styling Conventions:**

- Use CSS variables: `var(--color-primary)`
- Colors defined in OKLCH format
- Glass morphism with cosmic theme
- Responsive design with mobile-first approach

### Backend Standards

**API Design:**

- RESTful endpoints with clear naming
- Comprehensive error handling
- Request/response validation with Pydantic
- Detailed logging for debugging

**Security Measures:**

- CORS configuration for frontend domains
- Environment variable management
- No user data persistence
- Secure API key handling

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. **Build the application:**

   ```bash
   cd apps/frontend
   pnpm build
   ```

2. **Deploy to Vercel:**

   ```bash
   npx vercel --prod
   ```

### Backend (Render/Railway)

**Build Command:**

```bash
pip install -r requirements.txt
```

**Start Command:**

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Automatically provided by hosting platform

### CORS Configuration

Update backend CORS origins to include deployed frontend URL:

```python
origins = [
    "http://localhost:3000",           # Development
    "https://your-app.vercel.app",     # Production frontend
]
```

## 📈 Performance Considerations

### Frontend Optimizations

- **Client-side hydration**: Prevents SSR mismatches with time-dependent content
- **Progressive loading**: Features unlock based on user journey stage
- **Efficient state management**: Minimal re-renders with optimized hooks
- **localStorage optimization**: Efficient data serialization/deserialization

### Backend Optimizations

- **Stateless design**: Horizontal scaling capability
- **Efficient AI prompts**: Optimized for Gemini API response quality
- **Error boundary handling**: Graceful degradation on API failures
- **Request validation**: Early validation to prevent unnecessary processing

## 🔒 Privacy & Security

### Data Protection

- **Local-first architecture**: Data never leaves user's device for storage
- **In-flight processing**: Temporary analysis without persistence
- **No user tracking**: No analytics or user identification
- **Transparent data handling**: Clear documentation of data flow

### Security Measures

- **API key protection**: Environment variable management
- **CORS protection**: Restricted to authorized domains
- **Input validation**: Comprehensive request sanitization
- **Error handling**: No sensitive information in error messages

## 🧪 Testing Strategy

### Frontend Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
```

### Backend Testing

```bash
# Unit tests
pytest

# API tests
pytest tests/test_api.py

# Type checking
mypy main.py
```

## 📚 API Documentation

### Authentication

No authentication required - stateless design with client-side data management.

### Endpoints

#### `POST /api/v1/analyze-patterns`

**Request Body:**

```json
{
  "entries": [
    {
      "id": "uuid-string",
      "date": "2024-01-01T00:00:00Z",
      "mood": 7,
      "energy": 8,
      "note": "Great day with friends",
      "tags": ["social", "exercise"]
    }
  ]
}
```

**Response:**

```json
{
  "analysis": "### Your Aura Report...",
  "entries_analyzed": 10,
  "analysis_type": "trauma_informed"
}
```

## 📋 Troubleshooting

### Common Issues

**Hydration Mismatch:**

```typescript
// Use isClient state to prevent SSR mismatches
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
```

**CORS Errors:**

- Ensure backend CORS includes frontend URL
- Check API endpoint URLs in environment variables

**LocalStorage Issues:**

- Verify browser localStorage support
- Check data serialization/deserialization

**API Connection:**

- Verify backend server is running
- Check Gemini API key configuration
- Validate network connectivity

## 🏆 Project Achievements

### Technical Innovations

- **Stateless AI Analysis**: No server-side data persistence
- **Progressive UX**: Journey-based feature unlocking
- **Trauma-Informed AI**: Specialized prompts for emotional healing
- **Multi-Model Forecasting**: Statistical prediction approaches

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI4P Hackathon by Deepfunding** for inspiring the "Peace with Oneself" theme
- **Google Gemini** for powerful AI analysis capabilities
- **Next.js & FastAPI teams** for excellent development frameworks
- **Open source community** for the foundational tools and libraries

---

**Built with ❤️ for the AI4P Hackathon**

*"True peace comes from understanding the patterns, the subtle, longitudinal rhythms of our own lives."*
