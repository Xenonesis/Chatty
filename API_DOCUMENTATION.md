# API Documentation - AI Chat Portal

Base URL: `http://localhost:8000/api`

## Authentication

Currently, the API does not require authentication. For production, implement token-based authentication.

## Endpoints

### Conversations

#### 1. List All Conversations

Get a list of all conversations with basic metadata.

**Endpoint:** `GET /conversations/`

**Response:**
```json
[
  {
    "id": 1,
    "title": "My First Chat",
    "start_timestamp": "2024-01-15T10:30:00Z",
    "end_timestamp": "2024-01-15T11:00:00Z",
    "status": "ended",
    "message_count": 12,
    "duration": 1800.0,
    "metadata": {
      "topics": ["python", "programming", "django"]
    }
  }
]
```

#### 2. Get Conversation Details

Get detailed information about a specific conversation including all messages.

**Endpoint:** `GET /conversations/{id}/`

**Parameters:**
- `id` (path parameter): Conversation ID

**Response:**
```json
{
  "id": 1,
  "title": "My First Chat",
  "start_timestamp": "2024-01-15T10:30:00Z",
  "end_timestamp": "2024-01-15T11:00:00Z",
  "status": "ended",
  "ai_summary": "Discussion about Python programming and Django framework...",
  "metadata": {
    "topics": ["python", "programming", "django"],
    "message_count": 12,
    "duration_seconds": 1800
  },
  "messages": [
    {
      "id": 1,
      "conversation": 1,
      "content": "Hello, I want to learn about Python",
      "sender": "user",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "conversation": 1,
      "content": "Hello! I'd be happy to help you learn Python...",
      "sender": "ai",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "message_count": 12,
  "duration": 1800.0
}
```

#### 3. Create New Conversation

Create a new conversation.

**Endpoint:** `POST /conversations/`

**Request Body:**
```json
{
  "title": "Learning Python",
  "metadata": {}
}
```

**Response:**
```json
{
  "id": 2,
  "title": "Learning Python",
  "start_timestamp": "2024-01-15T12:00:00Z",
  "end_timestamp": null,
  "status": "active",
  "message_count": 0,
  "duration": 0.0,
  "metadata": {}
}
```

#### 4. End Conversation

End an active conversation and generate an AI summary.

**Endpoint:** `POST /conversations/{id}/end/`

**Parameters:**
- `id` (path parameter): Conversation ID

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "title": "My First Chat",
    "start_timestamp": "2024-01-15T10:30:00Z",
    "end_timestamp": "2024-01-15T11:00:00Z",
    "status": "ended",
    "ai_summary": "This conversation covered Python programming basics...",
    "metadata": {
      "topics": ["python", "programming"],
      "message_count": 12,
      "duration_seconds": 1800
    },
    "messages": [...],
    "message_count": 12,
    "duration": 1800.0
  },
  "summary": "This conversation covered Python programming basics..."
}
```

**Error Responses:**
- `404 Not Found`: Conversation does not exist
- `400 Bad Request`: Conversation is already ended

### Messages

#### 5. Send Message

Send a message in a conversation and receive an AI response.

**Endpoint:** `POST /messages/send/`

**Request Body:**
```json
{
  "conversation_id": 1,
  "content": "What is Django?"
}
```

**Response:**
```json
{
  "user_message": {
    "id": 13,
    "conversation": 1,
    "content": "What is Django?",
    "sender": "user",
    "timestamp": "2024-01-15T12:05:00Z"
  },
  "ai_message": {
    "id": 14,
    "conversation": 1,
    "content": "Django is a high-level Python web framework...",
    "sender": "ai",
    "timestamp": "2024-01-15T12:05:03Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or conversation is not active
- `404 Not Found`: Conversation does not exist

### Intelligence

#### 6. Query Intelligence

Ask questions about past conversations and get AI-powered answers.

**Endpoint:** `POST /intelligence/query/`

**Request Body:**
```json
{
  "query": "What programming languages have I discussed?",
  "search_keywords": "programming"
}
```

**Parameters:**
- `query` (required): The question to ask
- `search_keywords` (optional): Keywords to filter relevant conversations

**Response:**
```json
{
  "answer": "Based on your conversations, you have discussed Python and JavaScript. In your conversation from January 15th, you focused on Python and Django...",
  "relevant_conversations": [
    {
      "id": 1,
      "title": "Learning Python",
      "start_timestamp": "2024-01-15T10:30:00Z",
      "end_timestamp": "2024-01-15T11:00:00Z",
      "status": "ended",
      "message_count": 12,
      "duration": 1800.0,
      "metadata": {...}
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing query parameter

#### 7. Search Conversations

Search for conversations by keywords or semantic meaning.

**Endpoint:** `GET /conversations/search/`

**Query Parameters:**
- `q` (required): Search query
- `semantic` (optional): Use semantic search if `true`, keyword search if `false` (default: `false`)

**Example:**
```
GET /conversations/search/?q=python&semantic=true
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Learning Python",
      "start_timestamp": "2024-01-15T10:30:00Z",
      "end_timestamp": "2024-01-15T11:00:00Z",
      "status": "ended",
      "message_count": 12,
      "duration": 1800.0,
      "metadata": {
        "topics": ["python", "programming"]
      }
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Missing query parameter

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

## Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request creating a resource
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider implementing rate limiting to prevent abuse.

## CORS

The API supports CORS for the following origins (configured in settings):
- `http://localhost:3000`
- `http://127.0.0.1:3000`

For production, update `CORS_ALLOWED_ORIGINS` in Django settings.

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

**Example:**
```
GET /conversations/?page=2&page_size=10
```

**Paginated Response:**
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/conversations/?page=3",
  "previous": "http://localhost:8000/api/conversations/?page=1",
  "results": [...]
}
```

## WebSocket Support (Future)

For real-time streaming responses, WebSocket support can be added using Django Channels.

## OpenAPI/Swagger Documentation

To generate OpenAPI documentation, install:
```bash
pip install drf-spectacular
```

Then access interactive API docs at: `http://localhost:8000/api/schema/swagger-ui/`
