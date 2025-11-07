# AI Chat Portal - Backend

Django REST Framework backend for the AI Chat Portal application.

## Features

- RESTful API for conversation management
- Support for multiple LLM providers (OpenAI, Claude, Gemini, LM Studio)
- Conversation intelligence and analysis
- PostgreSQL database with optimized queries
- Automatic conversation summarization
- Semantic search capabilities

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip and virtualenv

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create PostgreSQL database:
```sql
CREATE DATABASE chatportal_db;
CREATE USER chatportal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatportal_db TO chatportal_user;
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Documentation

### Conversations

#### List all conversations
```
GET /api/conversations/
```

#### Create new conversation
```
POST /api/conversations/
{
  "title": "My Conversation",
  "metadata": {}
}
```

#### Get conversation details
```
GET /api/conversations/{id}/
```

#### End conversation (generates summary)
```
POST /api/conversations/{id}/end/
```

### Messages

#### Send message and get AI response
```
POST /api/messages/send/
{
  "conversation_id": 1,
  "content": "Hello, how are you?"
}
```

### Intelligence

#### Query about past conversations
```
POST /api/intelligence/query/
{
  "query": "What did we discuss about Python?",
  "search_keywords": "python"
}
```

#### Search conversations
```
GET /api/conversations/search/?q=keyword&semantic=false
```

## AI Provider Configuration

### LM Studio (Recommended for Local)
```env
AI_PROVIDER=lmstudio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
AI_MODEL=local-model
```

### OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
AI_MODEL=gpt-4
```

### Anthropic Claude
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_api_key
AI_MODEL=claude-3-opus-20240229
```

### Google Gemini
```env
AI_PROVIDER=google
GOOGLE_API_KEY=your_api_key
AI_MODEL=gemini-pro
```

## Testing

Run tests:
```bash
python manage.py test
```

## Database Schema

### Conversation Model
- id (primary key)
- title (varchar)
- start_timestamp (datetime)
- end_timestamp (datetime, nullable)
- status (varchar: active/ended)
- ai_summary (text, nullable)
- metadata (json)

### Message Model
- id (primary key)
- conversation_id (foreign key)
- content (text)
- sender (varchar: user/ai)
- timestamp (datetime)

## Architecture

The backend follows a clean architecture with:
- **Models**: Database schema and business logic
- **Serializers**: Data validation and transformation
- **Views**: API endpoints and request handling
- **AI Service**: Unified interface for multiple LLM providers
- **Admin**: Django admin interface for management

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper `SECRET_KEY`
3. Set up production database
4. Configure static files serving
5. Use gunicorn or uwsgi for WSGI
6. Set up Nginx as reverse proxy
7. Enable HTTPS with SSL certificates

## License

MIT License
