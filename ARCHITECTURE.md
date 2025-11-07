# Architecture Documentation - AI Chat Portal

## System Architecture

### Overview

The AI Chat Portal follows a modern full-stack architecture with clear separation of concerns between frontend, backend, and data layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js + React + TypeScript                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │    Chat    │  │Conversations│  │   Intelligence     │ │  │
│  │  │ Interface  │  │    List     │  │      Query         │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Django REST Framework                       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │   Views    │  │Serializers │  │     AI Service     │ │  │
│  │  │(Endpoints) │  │(Validation)│  │  (LLM Integration) │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  │  ┌────────────┐                                          │  │
│  │  │   Models   │  Database ORM Layer                      │  │
│  │  └────────────┘                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                    │  │
│  │  ┌────────────────┐         ┌──────────────────────┐    │  │
│  │  │ Conversations  │◄────────│      Messages        │    │  │
│  │  └────────────────┘         └──────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────────────┐     │
│  │ OpenAI │  │ Claude │  │ Gemini │  │    LM Studio     │     │
│  └────────┘  └────────┘  └────────┘  │  (Local LLM)     │     │
│                                       └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture

#### Component Structure

```
app/
├── page.tsx                 # Main application entry
├── layout.tsx              # Root layout with metadata
└── globals.css             # Global styles

components/
├── ChatInterface.tsx       # Real-time chat component
├── ConversationsList.tsx   # Conversation history management
└── IntelligenceQuery.tsx   # AI-powered query interface

lib/
└── api.ts                  # API client with typed interfaces
```

#### Component Responsibilities

**ChatInterface:**
- Real-time message display
- User input handling
- Conversation lifecycle management (create, send, end)
- Auto-scrolling and loading states

**ConversationsList:**
- Display conversation history
- Search and filter functionality
- Conversation details panel
- Navigation to chat interface

**IntelligenceQuery:**
- Query form for conversation intelligence
- Semantic search interface
- Display of AI-generated answers
- Relevant conversation suggestions

#### State Management

- Component-level state using React hooks (useState, useEffect)
- Props drilling for communication between components
- Future: Consider Redux or Zustand for global state

### Backend Architecture

#### Layer Structure

```
backend/
├── config/                 # Project configuration
│   ├── settings.py        # Django settings
│   ├── urls.py            # Root URL configuration
│   └── wsgi.py            # WSGI application
│
├── chat/                  # Main application
│   ├── models.py          # Data models (ORM)
│   ├── serializers.py     # Data validation & transformation
│   ├── views.py           # API endpoints (controllers)
│   ├── urls.py            # URL routing
│   ├── ai_service.py      # AI integration layer
│   ├── admin.py           # Admin interface
│   └── tests.py           # Unit tests
│
└── manage.py              # Django management script
```

#### Design Patterns

**1. MVC (Model-View-Controller)**
- Models: Database entities (Conversation, Message)
- Views: API endpoints handling requests
- Serializers: Data transformation layer

**2. Service Layer Pattern**
- AIService: Encapsulates AI provider logic
- Single responsibility for LLM interactions
- Provider-agnostic interface

**3. Repository Pattern**
- Django ORM acts as repository
- Models provide database abstraction
- QuerySets for efficient data retrieval

**4. Strategy Pattern**
- AIService supports multiple providers
- Runtime selection based on configuration
- Easy to add new providers

### Database Architecture

#### Schema Design

**Conversations Table:**
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    start_timestamp TIMESTAMP NOT NULL,
    end_timestamp TIMESTAMP,
    status VARCHAR(10) NOT NULL,
    ai_summary TEXT,
    metadata JSONB,
    CONSTRAINT status_check CHECK (status IN ('active', 'ended'))
);

CREATE INDEX idx_conversations_start ON conversations(start_timestamp DESC);
CREATE INDEX idx_conversations_status ON conversations(status);
```

**Messages Table:**
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT sender_check CHECK (sender IN ('user', 'ai'))
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, timestamp);
CREATE INDEX idx_messages_sender ON messages(sender);
```

#### Database Optimization

- **Indexes**: Created on frequently queried fields
- **Foreign Keys**: Ensure referential integrity
- **Cascading Deletes**: Automatic cleanup of related messages
- **JSONB**: Flexible metadata storage with query capabilities

### API Architecture

#### RESTful Design Principles

**Resource-Based URLs:**
- `/api/conversations/` - Collection
- `/api/conversations/{id}/` - Individual resource
- `/api/messages/send/` - Action endpoint

**HTTP Methods:**
- GET: Retrieve data
- POST: Create or perform action
- PUT/PATCH: Update (future)
- DELETE: Remove (future)

**Response Format:**
- Consistent JSON structure
- Proper HTTP status codes
- Error messages in standard format

#### API Layers

```
Request → Middleware → URL Router → View → Serializer → Model → Database
                                      ↓
                                  AI Service → External API
                                      ↓
Response ← Serializer ← View ← Model ← Database
```

### AI Integration Architecture

#### AIService Class

The `AIService` class provides a unified interface for multiple LLM providers:

```python
class AIService:
    - __init__(): Initialize client based on configuration
    - generate_response(): Generate AI responses
    - generate_summary(): Create conversation summaries
    - analyze_sentiment(): Sentiment analysis
    - extract_key_topics(): Topic extraction
    - query_conversations(): Answer questions about history
    - semantic_search(): Find relevant conversations
```

#### Provider Abstraction

Each provider is handled through a common interface:
1. Initialize client with API credentials
2. Format messages according to provider's requirements
3. Call provider's API
4. Parse and return standardized response

#### Error Handling

- Try-catch blocks for API calls
- Graceful degradation on failures
- User-friendly error messages
- Logging for debugging

## Data Flow

### Chat Flow

```
1. User types message in ChatInterface
2. Frontend calls API: POST /api/messages/send/
3. Backend validates conversation status
4. Backend saves user message to database
5. Backend prepares conversation history
6. Backend calls AIService.generate_response()
7. AIService calls LLM API
8. AI response is saved to database
9. Both messages returned to frontend
10. ChatInterface updates UI
```

### Conversation End Flow

```
1. User clicks "End & Summarize"
2. Frontend calls API: POST /api/conversations/{id}/end/
3. Backend retrieves all messages
4. Backend calls AIService.generate_summary()
5. AIService generates summary via LLM
6. Backend calls AIService.extract_key_topics()
7. Backend updates conversation with summary and metadata
8. Updated conversation returned to frontend
9. Frontend displays summary to user
```

### Intelligence Query Flow

```
1. User enters query in IntelligenceQuery
2. Frontend calls API: POST /api/intelligence/query/
3. Backend filters conversations by keywords (if provided)
4. Backend prepares conversation data
5. Backend calls AIService.query_conversations()
6. AIService generates contextual answer
7. Backend returns answer and relevant conversations
8. Frontend displays results
```

## Security Considerations

### Current Implementation

1. **CORS**: Configured allowed origins
2. **CSRF**: Django CSRF protection enabled
3. **Input Validation**: Serializers validate all input
4. **SQL Injection**: ORM prevents SQL injection
5. **Environment Variables**: Sensitive data in .env

### Future Enhancements

- [ ] User authentication (JWT tokens)
- [ ] Rate limiting per user/IP
- [ ] API key authentication
- [ ] Input sanitization for XSS
- [ ] HTTPS enforcement
- [ ] Database encryption at rest

## Scalability

### Current Capacity

- Handles moderate load (100s of users)
- Single server deployment
- Synchronous processing

### Scaling Strategies

**Horizontal Scaling:**
- Load balancer in front of multiple app servers
- Shared PostgreSQL database
- Redis for session storage

**Database Scaling:**
- Read replicas for query load
- Connection pooling
- Query optimization

**Async Processing:**
- Celery for background tasks
- Redis for task queue
- Async AI response generation

**Caching:**
- Redis for frequently accessed data
- Cache conversation lists
- Cache AI responses for similar queries

## Performance Optimization

### Backend

1. **Database Queries**
   - Select related for foreign keys
   - Prefetch related for reverse relations
   - Pagination for large datasets
   - Database indexes on frequently queried fields

2. **API Response Time**
   - Minimize database queries
   - Use serializer optimizations
   - Compress responses

3. **AI Service**
   - Async API calls (future)
   - Response caching
   - Prompt optimization

### Frontend

1. **React Optimization**
   - Memoization with useMemo/useCallback
   - Lazy loading components
   - Code splitting

2. **Network**
   - API response caching
   - Debounce search inputs
   - Optimistic UI updates

3. **Build**
   - Next.js automatic optimization
   - Image optimization
   - Bundle size monitoring

## Testing Strategy

### Backend Tests

- **Unit Tests**: Models, serializers, utilities
- **Integration Tests**: API endpoints
- **Service Tests**: AIService functionality

### Frontend Tests

- **Component Tests**: React Testing Library
- **Integration Tests**: User flows
- **E2E Tests**: Cypress/Playwright

### Test Coverage Goals

- Backend: >80% coverage
- Frontend: >70% coverage
- Critical paths: 100% coverage

## Monitoring & Logging

### Logging Strategy

```python
import logging

logger = logging.getLogger(__name__)

# Log levels:
# DEBUG: Detailed information
# INFO: General information
# WARNING: Warning messages
# ERROR: Error messages
# CRITICAL: Critical issues
```

### Metrics to Monitor

- API response times
- Database query performance
- AI API latency
- Error rates
- User activity

### Tools (Future)

- Sentry for error tracking
- New Relic/DataDog for APM
- ELK stack for log aggregation
- Prometheus + Grafana for metrics

## Future Architecture Improvements

1. **Microservices**: Split into chat, intelligence, and user services
2. **Event-Driven**: Use message queues for async processing
3. **WebSockets**: Real-time streaming responses
4. **GraphQL**: Alternative to REST API
5. **Serverless**: Deploy functions on AWS Lambda/Vercel
6. **CDN**: Serve static assets via CDN
7. **Multi-tenancy**: Support multiple organizations
8. **Mobile Apps**: Native iOS/Android apps
