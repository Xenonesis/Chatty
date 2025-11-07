# ChatSumm – AI Conversation Intelligence Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/django-5.0-green.svg)
![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

ChatSumm is a full-stack web application that delivers real-time AI-assisted conversations, long-term conversation memory, and intelligence tooling such as semantic search, summarisation, and natural-language querying over historical threads. The project pairs a Django REST API with a modern Next.js frontend and supports multiple LLM providers including OpenAI, Anthropic Claude, Google Gemini, and locally hosted LM Studio models.

---

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Configuration](#configuration)
7. [Available Commands](#available-commands)
8. [API Overview](#api-overview)
9. [Data Model Summary](#data-model-summary)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Development Guidelines](#development-guidelines)
13. [Contributing](#contributing)
14. [License](#license)
15. [Support](#support)

---

## Overview

Bring advanced conversation intelligence to your team. ChatSumm captures every message exchanged with Large Language Models (LLMs), stores them in PostgreSQL, and layers intelligence features—summaries, semantic search, and contextual question answering—on top of that history. The frontend delivers a polished, responsive interface, while the backend exposes a clean REST API for integrations or automation.

## Key Features

- **Unified Conversation Hub** – Manage multiple AI chat sessions with persistent history and metadata.
- **Conversation Intelligence** – Auto-generated summaries, semantic search, and natural-language queries across past chats.
- **Pluggable AI Providers** – Switch between OpenAI, Anthropic, Google Gemini, or LM Studio without code changes.
- **Modern Frontend UX** – Tailwind-powered Next.js interface with responsive layout, dark mode, and rich conversation context.
- **Production-Ready Backend** – Django REST Framework with authentication hooks, validation, and clean architecture.
- **Operational Tooling** – Helper scripts for setup, development, and deployment workflows on Windows, macOS, and Linux.

### Detailed Features

#### 1. Real-Time Chat Interface ✨
Interactive chat interface for real-time conversations with AI, featuring a modern, ChatGPT-like UI.
- Message Display: User messages on right (blue), AI messages on left (gray)
- Timestamps: Each message shows time sent
- Auto-Scroll: Automatically scrolls to newest message
- Loading States: Animated "thinking" indicator while AI generates response
- Message Input: Text input with send button
- Character Limit: Handles long messages with proper formatting
- Line Breaks: Preserves formatting in messages

#### 2. Conversation Management 📚
Comprehensive system for creating, storing, and organizing chat sessions.
- Create Conversations: Start new chat sessions
- Store History: All messages saved to database
- Auto-Title: Automatic conversation naming
- Status Tracking: Active vs Ended status
- Metadata Storage: JSON field for flexible data
- Duration Tracking: Calculate conversation length
- Message Count: Track number of messages

#### 3. AI Conversation Intelligence 🧠
Advanced AI-powered features for analyzing and querying conversation history.
- Automatic Summarization: Triggers when conversation ends
- Topic Extraction: Automatically identifies main topics
- Sentiment Analysis: Framework ready for tone analysis
- Intelligent Querying: Ask questions about past conversations
- Semantic Search: Search by meaning, not just keywords

#### 4. Multi-LLM Provider Support 🤖
Unified interface supporting multiple AI providers with easy switching.
- LM Studio (Local): Privacy, no API costs, offline capable
- OpenAI: High quality, fast responses, reliable
- Anthropic Claude: Excellent reasoning, long context
- Google Gemini: Free tier, multimodal capable

## Architecture & Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Django 5, Django REST Framework, Python 3.9+, Celery-ready architecture |
| Database | PostgreSQL 12+ |
| AI Providers | OpenAI, Anthropic Claude, Google Gemini, LM Studio |
| Tooling | npm workspaces, PowerShell/Bash scripts, ESLint, PostCSS |

**Execution Flow**
1. UI sends chat actions to the REST API via the `lib/api.ts` client.
2. Django processes requests, persists conversations and messages, and delegates AI calls to `chat/ai_service.py`.
3. Responses are returned alongside updated conversation metadata for rendering in the frontend.

## Project Structure

```
├── app/                 # Next.js application (App Router)
├── components/          # Reusable React components (Chat UI, Intelligence tools)
├── lib/                 # Frontend utilities and API client
├── backend/
│   ├── config/          # Django project configuration (settings, urls, asgi/wsgi)
│   └── chat/            # Conversation domain logic, REST API, AI integration
├── public/              # Static assets served by Next.js
├── run*.ps1|sh          # Helper scripts for Windows / Unix shells
├── package.json         # Combined frontend/back-end orchestration scripts
└── README.md            # You are here
```

## Getting Started

### Prerequisites
- Node.js **18+** and npm
- Python **3.9+** (with `venv` module)
- PostgreSQL **12+** running locally or remotely

### Quick Start (recommended)

```bash
npm install      # installs Node dependencies and ensures backend requirements
npm run dev      # starts backend (port 8000) and frontend (port 3000)
```

The orchestration script will:
1. Kill any previous servers bound to ports 3000/8000.
2. Create/activate a Python virtual environment inside `backend/.venv`.
3. Install Python dependencies from `backend/requirements.txt`.
4. Run Django migrations and bootstrap the database.
5. Launch the Django API and Next.js dev server with combined logs.

Stop both services with `Ctrl+C` in the same terminal.

### Manual Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # then edit with your secrets
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Manual Frontend Setup

```bash
npm install
cp .env.local.example .env.local   # configure NEXT_PUBLIC_BACKEND_URL
npm run dev                        # http://localhost:3000
```

## Configuration

### Backend (`backend/.env`)

```env
DJANGO_SECRET_KEY=your-secret
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME

AI_PROVIDER=openai                 # openai | anthropic | google | lmstudio
AI_MODEL=gpt-4o-mini               # provider-specific model identifier

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> 💡 Environment templates (`backend/.env.example`, `.env.local.example`) are provided—copy and customise them rather than editing defaults.

## Available Commands

### npm Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Spin up backend and frontend together with automatic setup. |
| `npm run dev:backend` | Start only the Django API (uses virtual environment). |
| `npm run dev:frontend` | Start only the Next.js app. |
| `npm run setup:backend` | Recreate the backend virtual environment and install dependencies. |

### Shell Helpers

- `run.ps1` / `run.sh` – Orchestrate full-stack dev environment on Windows or Unix shells.
- `run_backend.ps1` / `run_backend.sh` – Backend-only launcher.
- `run_frontend.ps1` / `run_frontend.sh` – Frontend-only launcher.

## API Overview

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/conversations/` | GET | List conversations with metadata. |
| `/api/conversations/` | POST | Create a new conversation. |
| `/api/conversations/{id}/` | GET | Retrieve one conversation and its messages. |
| `/api/conversations/{id}/end/` | POST | Finalise a conversation and trigger summary generation. |
| `/api/messages/send/` | POST | Send a user message and receive an AI response. |
| `/api/conversations/search/` | GET | Keyword or semantic search across conversations. |
| `/api/intelligence/query/` | POST | Ask questions about historical chats using semantic reasoning. |

The REST API returns JSON responses. Authentication middleware is ready for extension if you need multi-user support.

## Data Model Summary

**Conversation**
- `id` – Primary key
- `title` – Display name
- `status` – `active` or `ended`
- `start_timestamp` / `end_timestamp`
- `ai_summary` – AI-generated synopsis
- `metadata` – JSON field for provider/model context

**Message**
- `id`
- `conversation` – Foreign key to `Conversation`
- `sender` – `user` or `ai`
- `content` – Message body
- `timestamp`

## Testing

```bash
# Backend
cd backend
python manage.py test

# Frontend (add Vitest/Jest as needed)
npm run test
```

Consider adding integration tests that exercise the REST API via the frontend client to guard against regressions in AI provider flows.

## Deployment

1. **Backend** – Deploy via Gunicorn + Nginx on a VPS or use a managed platform (Railway, Render, Heroku). Set `DJANGO_SETTINGS_MODULE` to production settings and configure PostgreSQL.
2. **Frontend** – Build with `npm run build` and deploy to Vercel, Netlify, or any static hosting that supports Next.js server components.
3. **Environment** – Provide production API keys and secure secrets through environment variables. Ensure HTTPS termination for both layers.

Optional enhancements include Dockerising the stack, enabling Redis-backed Celery workers for background summarisation, and configuring observability (Sentry, OpenTelemetry).

## Development Guidelines

- Follow the existing TypeScript and Python linting conventions. Run `npm run lint` before submitting changes.
- Keep AI provider logic encapsulated in `backend/chat/ai_service.py`; add adapters rather than branching across the codebase.
- Use environment variables for secrets—never commit API keys.
- Prefer small, focused pull requests with updated tests and documentation.

## Contributing

1. Fork the repository and create a feature branch.
2. Ensure linting/tests pass (`npm run lint`, `python manage.py test`).
3. Document user-facing changes directly in this README if applicable.
4. Submit a pull request describing the motivation, testing, and rollout plan.

## License

Distributed under the MIT License. See `LICENSE` for details.

## Support

For questions, feature requests, or bug reports, open an issue or reach out to the maintainers. Product context and requirements remain documented in `prd.md`.

---

Built with ❤️ to make AI conversations smarter, searchable, and shareable.
