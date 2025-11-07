# 🤖 AI Chat Portal with Conversation Intelligence

A full-stack web application that enables real-time conversations with Large Language Models (LLMs), stores conversation histories, and provides AI-powered conversation analysis and intelligence features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/django-5.0-green.svg)
![Next.js](https://img.shields.io/badge/next.js-16.0-black.svg)
![React](https://img.shields.io/badge/react-19.2-blue.svg)

## ✨ Features

### Core Features
- **Real-time Chat Interface**: Interactive messaging with AI powered by multiple LLM providers
- **Conversation Management**: Create, store, and organize chat sessions with full history
- **AI Conversation Intelligence**: 
  - Automatic conversation summarization
  - Semantic search across conversations
  - Intelligent querying about past discussions
  - Topic extraction and analysis
- **Multiple LLM Support**: OpenAI, Claude, Gemini, and LM Studio (local hosting)
- **Modern UI/UX**: Responsive design with dark mode support using Tailwind CSS
- **Production-Ready**: Clean architecture, comprehensive error handling, and optimized database queries

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Django REST Framework 3.14
- PostgreSQL 12+
- Python 3.9+

**Frontend:**
- Next.js 16.0 (React 19.2)
- TypeScript
- Tailwind CSS 4

**AI Integration:**
- OpenAI API
- Anthropic Claude API
- Google Gemini API
- LM Studio (local LLM hosting)

### Project Structure

```
ai-chat-portal/
├── backend/                 # Django REST Framework backend
│   ├── config/             # Django project configuration
│   ├── chat/               # Main chat application
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # API serializers
│   │   ├── views.py        # API endpoints
│   │   ├── ai_service.py   # AI integration service
│   │   └── urls.py         # URL routing
│   ├── manage.py
│   └── requirements.txt
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ChatInterface.tsx
│   ├── ConversationsList.tsx
│   └── IntelligenceQuery.tsx
├── lib/                   # Utilities
│   └── api.ts            # API client
├── public/               # Static assets
└── README.md
```

## 📸 Screenshots

### Chat Interface
Modern, responsive chat interface with real-time messaging and conversation management.

### Conversations Dashboard
Browse and search through your conversation history with detailed metadata and summaries.

### Intelligence Query
Ask questions about your past conversations and get AI-powered insights.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 12+

### Backend Setup

1. **Setup PostgreSQL:**
```bash
createdb chatportal_db
```

2. **Install backend dependencies:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials and AI API keys
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. **Start backend server:**
```bash
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### Frontend Setup

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.local.example .env.local
# Edit .env.local with backend API URL
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

## 🔑 AI Provider Configuration

### LM Studio (Recommended for Local/Privacy)

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a model (e.g., Llama 2, Mistral, Phi)
3. Start the local server in LM Studio
4. Configure in `backend/.env`:
```env
AI_PROVIDER=lmstudio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
AI_MODEL=local-model
```

### OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
```

### Anthropic Claude

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-3-opus-20240229
```

### Google Gemini

```env
AI_PROVIDER=google
GOOGLE_API_KEY=...
AI_MODEL=gemini-pro
```

## 📚 API Documentation

### Conversations

#### List all conversations
```http
GET /api/conversations/
```

#### Get conversation details
```http
GET /api/conversations/{id}/
```

#### Create new conversation
```http
POST /api/conversations/
Content-Type: application/json

{
  "title": "New Conversation"
}
```

#### End conversation (generates summary)
```http
POST /api/conversations/{id}/end/
```

### Messages

#### Send message and get AI response
```http
POST /api/messages/send/
Content-Type: application/json

{
  "conversation_id": 1,
  "content": "Hello, how are you?"
}
```

### Intelligence

#### Query about past conversations
```http
POST /api/intelligence/query/
Content-Type: application/json

{
  "query": "What did we discuss about Python?",
  "search_keywords": "python"
}
```

#### Search conversations
```http
GET /api/conversations/search/?q=keyword&semantic=true
```

## 🗄️ Database Schema

### Conversation Model
- `id` (Primary Key)
- `title` (VARCHAR)
- `start_timestamp` (DATETIME)
- `end_timestamp` (DATETIME, nullable)
- `status` (VARCHAR: 'active' | 'ended')
- `ai_summary` (TEXT, nullable)
- `metadata` (JSON)

### Message Model
- `id` (Primary Key)
- `conversation_id` (Foreign Key → Conversation)
- `content` (TEXT)
- `sender` (VARCHAR: 'user' | 'ai')
- `timestamp` (DATETIME)

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
npm run test  # (configure as needed)
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Deploy Options

- **Backend**: Heroku, AWS, DigitalOcean, or any VPS with Gunicorn + Nginx
- **Frontend**: Vercel, Netlify, or any Node.js hosting
- **Database**: PostgreSQL on AWS RDS, Heroku Postgres, or managed PostgreSQL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Django REST Framework for the robust backend framework
- Next.js team for the excellent React framework
- OpenAI, Anthropic, Google for their AI APIs
- LM Studio for local LLM hosting capabilities

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Real-time streaming responses
- [ ] Voice input/output integration
- [ ] Conversation export (PDF, JSON, Markdown)
- [ ] Multi-user support with authentication
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Conversation threading/branching

---

**Built with ❤️ for better AI conversations**
