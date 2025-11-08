# AI Intelligence System

## Overview

The ChattyAI Intelligence System is a sophisticated learning mechanism that analyzes user conversations and behaviors to create personalized AI experiences. The system learns from every interaction and stores insights both locally (browser) and in the database (server).

## Features

### 🧠 Automatic Learning
- **Conversation Analysis**: Automatically analyzes conversations to extract patterns
- **Behavior Tracking**: Tracks user interactions in real-time
- **Preference Detection**: Identifies user preferences for response styles
- **Topic Extraction**: Discovers topics the user is interested in
- **Communication Style**: Learns how the user prefers to communicate

### 📊 Intelligence Categories

#### 1. Preferences
- **Detailed Responses**: Whether user prefers comprehensive or concise answers
- **Code Examples**: Preference for code snippets and examples
- **Step-by-Step**: Preference for structured, step-by-step instructions

#### 2. Patterns
- **Message Length**: Average length of user messages
- **Question Types**: Types of questions frequently asked (how-to, what-is, why, etc.)
- **Follow-up Behavior**: Tendency to ask follow-up questions
- **Clarification Requests**: Frequency of asking for clarifications

#### 3. Topics
- **Favorite Topics**: Topics the user frequently discusses
- **Technical Interests**: Programming languages, frameworks, tools

#### 4. Communication Style
- **Message Patterns**: How the user structures their messages
- **Response Time**: When the user typically engages
- **Session Duration**: How long conversations typically last

### 💾 Storage Architecture

#### Local Storage (Browser)
```javascript
// Intelligence Profile
localStorage.setItem('chatty_user_intelligence', JSON.stringify({
  user_id: 'default_user',
  preferences: {...},
  patterns: {...},
  topics: {...},
  styles: {...},
  last_updated: '2025-01-08T...'
}));

// Behavior Events (last 100)
localStorage.setItem('chatty_behavior_events', JSON.stringify([
  {
    type: 'message_sent',
    data: {...},
    timestamp: '2025-01-08T...'
  }
]));
```

#### Database (Django)
- **UserIntelligence**: Stores learned intelligence records
- **ConversationInsight**: Stores per-conversation analysis
- **LearningEvent**: Audit trail of learning events

## API Endpoints

### Get User Intelligence
```http
GET /api/intelligence/user/?user_id=default_user
```

Returns complete intelligence profile with statistics.

### Get Personalized Context
```http
GET /api/intelligence/context/?user_id=default_user
```

Returns a context string to inject into AI prompts for personalization.

### Analyze Conversation
```http
POST /api/intelligence/analyze/{conversation_id}/
Content-Type: application/json

{
  "user_id": "default_user"
}
```

Analyzes a specific conversation and updates intelligence.

### Analyze All Conversations
```http
POST /api/intelligence/analyze-all/
Content-Type: application/json

{
  "user_id": "default_user"
}
```

Analyzes all user conversations to build comprehensive intelligence.

### Get Learning History
```http
GET /api/intelligence/history/?user_id=default_user&limit=50
```

Returns learning event history.

### Reset Intelligence
```http
DELETE /api/intelligence/reset/
Content-Type: application/json

{
  "user_id": "default_user"
}
```

Deletes all intelligence data for a user.

## Frontend Usage

### Using the Intelligence Hook

```typescript
import { useIntelligence } from '@/lib/useIntelligence';

function MyComponent() {
  const {
    intelligence,
    stats,
    loading,
    trackBehavior,
    analyzeConversation,
    fetchIntelligence
  } = useIntelligence('default_user');

  // Track a behavior
  trackBehavior('message_sent', {
    conversationId: 123,
    messageLength: 50,
    hasQuestion: true
  });

  // Analyze a conversation
  await analyzeConversation(123);

  // Get intelligence profile
  useEffect(() => {
    fetchIntelligence();
  }, []);

  return (
    <div>
      {intelligence?.preferences?.detailed_responses && (
        <p>User prefers detailed responses</p>
      )}
    </div>
  );
}
```

### Viewing Intelligence Profile

Navigate to the Profile tab (User icon) in the app to see:
- Intelligence statistics
- Learned preferences
- Favorite topics
- Communication style
- Learning history

## How It Works

### 1. Automatic Analysis
Every 3 messages sent, the system automatically analyzes the conversation:
```typescript
if (messages.length % 3 === 0) {
  analyzeConversation(conversationId);
}
```

### 2. Pattern Detection
The `IntelligenceService` analyzes:
- Message content and length
- Question patterns
- Topic keywords
- Response preferences
- Follow-up behavior

### 3. Confidence Scoring
Each learned insight has a confidence score (0.0 to 1.0):
- Starts at 0.5 (neutral)
- Increases with confirming evidence (+0.05 to +0.1)
- High confidence (>0.7) insights are prioritized

### 4. Personalized AI Responses
The system injects learned context into AI prompts:
```python
system_content = "You are a helpful AI assistant."
if personalized_context:
    system_content += f"\n\nUser context: {personalized_context}"
```

Example context:
> "User prefers detailed responses, code examples, step by step. User is interested in: python, react, django, api. User provides detailed context in messages."

## Privacy & Data

### User Isolation
- Each user has a unique `user_id`
- Intelligence is never shared between users
- Default user: `"default_user"`

### Data Retention
- Intelligence persists across sessions
- Stored in both browser (cache) and database (permanent)
- Can be reset at any time via the Profile page

### What's Tracked
- ✅ Message content patterns (not full content)
- ✅ Conversation metadata
- ✅ Interaction patterns
- ✅ Preference indicators
- ❌ Personal information
- ❌ Sensitive data

## Configuration

### Adjust Analysis Frequency
In `ChatInterface.tsx`:
```typescript
// Analyze every N messages
if (messages.length % 5 === 0) {  // Change 5 to desired frequency
  analyzeConversation(conversationId);
}
```

### Adjust Confidence Thresholds
In `intelligence_service.py`:
```python
# Minimum confidence to use in context
if data['confidence'] > 0.6:  # Adjust threshold
    # Use this intelligence
```

### Customize Learning Patterns
Add new patterns in `IntelligenceService._extract_question_types()`:
```python
patterns = {
    'how_to': r'\bhow (do|can|to|would)\b',
    'custom_pattern': r'\byour pattern here\b',
}
```

## Performance

### Optimization
- Analysis runs asynchronously
- Errors don't block user interactions
- Local storage provides instant access
- Database queries are indexed

### Scalability
- Indexed database fields for fast queries
- Limited to last 100 behavior events in local storage
- Conversation analysis limited to recent 20 conversations

## Future Enhancements

- [ ] Multi-user support with authentication
- [ ] Advanced NLP for better topic extraction
- [ ] Sentiment analysis
- [ ] Predictive suggestions
- [ ] Export intelligence data
- [ ] Intelligence sharing (opt-in)
- [ ] Machine learning models for pattern recognition
- [ ] Real-time intelligence updates via WebSocket

## Troubleshooting

### Intelligence Not Updating
1. Check browser console for errors
2. Verify backend is running
3. Check database migrations: `python manage.py migrate`
4. Clear local storage and re-analyze

### Low Confidence Scores
- Need more conversations for better learning
- Click "Analyze All" to process existing conversations
- Confidence increases over time with more data

### Missing Intelligence Data
- Ensure conversations are being ended (generates analysis)
- Check that messages are being saved to database
- Verify API endpoints are accessible

## Support

For issues or questions about the intelligence system:
1. Check the browser console for errors
2. Review the backend logs
3. Verify database tables exist: `UserIntelligence`, `ConversationInsight`, `LearningEvent`
4. Test API endpoints directly

---

**Built with ❤️ for personalized AI experiences**
