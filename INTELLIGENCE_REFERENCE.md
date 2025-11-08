# Intelligence System - Quick Reference

## 🎯 Quick Access

### View Intelligence Profile
1. Click **User icon** (👤) in header
2. See learned preferences, topics, and stats

### Analyze Conversations
- **Automatic**: Every 3 messages
- **Manual**: Click "Analyze All" in Profile tab
- **On End**: When conversation ends

### Reset Intelligence
Profile tab → Click "Reset" button → Confirm

## 📊 What Gets Learned

| Category | What | Example |
|----------|------|---------|
| **Preferences** | Response style | Detailed vs concise |
| | Code examples | Likes code snippets |
| | Instructions | Prefers step-by-step |
| **Topics** | Interests | Python, React, APIs |
| **Style** | Message length | Short or detailed |
| | Question types | How-to, what-is, why |
| **Patterns** | Follow-ups | Asks clarifying questions |
| | Timing | Active times of day |

## 🔧 API Quick Reference

```bash
# Get intelligence
GET /api/intelligence/user/?user_id=default_user

# Get AI context
GET /api/intelligence/context/?user_id=default_user

# Analyze conversation
POST /api/intelligence/analyze/123/
{"user_id": "default_user"}

# Analyze all
POST /api/intelligence/analyze-all/
{"user_id": "default_user"}

# Reset
DELETE /api/intelligence/reset/
{"user_id": "default_user"}
```

## 💻 Code Snippets

### Track Behavior
```typescript
import { useIntelligence } from '@/lib/useIntelligence';

const { trackBehavior } = useIntelligence();

trackBehavior('message_sent', {
  conversationId: 123,
  messageLength: 50,
  hasQuestion: true
});
```

### Get Intelligence
```typescript
const { intelligence, fetchIntelligence } = useIntelligence();

useEffect(() => {
  fetchIntelligence();
}, []);

// Access data
const prefers = intelligence?.preferences?.detailed_responses?.value;
const topics = intelligence?.topics?.favorite_topics?.value;
```

### Analyze Conversation
```typescript
const { analyzeConversation } = useIntelligence();

await analyzeConversation(conversationId);
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `UserIntelligence` | Learned patterns per user |
| `ConversationInsight` | Per-conversation analysis |
| `LearningEvent` | Audit trail of learning |

## 📁 File Locations

| File | Purpose |
|------|---------|
| `backend/chat/intelligence_models.py` | Database models |
| `backend/chat/intelligence_service.py` | Learning logic |
| `backend/chat/intelligence_views.py` | API endpoints |
| `lib/useIntelligence.ts` | React hook |
| `components/IntelligenceProfile.tsx` | UI component |

## 🎨 UI Components

### Profile Tab
- Statistics cards
- Preferences list
- Topics tags
- Communication style
- Action buttons

### Chat Interface
- Automatic tracking
- Periodic analysis
- Personalized responses

## 🔍 Debugging

### Check Intelligence
```typescript
// Browser console
localStorage.getItem('chatty_user_intelligence')
localStorage.getItem('chatty_behavior_events')
```

### Check Backend
```bash
cd backend
venv\Scripts\python.exe manage.py shell

from chat.intelligence_models import UserIntelligence
UserIntelligence.objects.all()
```

### Run Tests
```bash
cd backend
venv\Scripts\python.exe ..\test_intelligence.py
```

## ⚙️ Configuration

### Change Analysis Frequency
`components/ChatInterface.tsx` line ~335:
```typescript
if (messages.length % 3 === 0) {  // Change 3
```

### Change Confidence Threshold
`backend/chat/intelligence_service.py` line ~290:
```python
if data['confidence'] > 0.6:  # Change 0.6
```

### Change Storage Limit
`lib/useIntelligence.ts` line ~75:
```typescript
if (events.length > 100) {  // Change 100
```

## 📈 Confidence Scores

| Score | Meaning |
|-------|---------|
| 0.0 - 0.3 | Low confidence |
| 0.4 - 0.6 | Medium confidence |
| 0.7 - 1.0 | High confidence |

Scores increase with:
- More conversations
- Consistent patterns
- Confirming evidence

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| No intelligence showing | Click "Analyze All" |
| Low confidence scores | Need more conversations |
| Not learning | Check browser console |
| API errors | Verify backend running |
| Database errors | Run migrations |

## 📚 Documentation

- **Full Guide**: `INTELLIGENCE_SYSTEM.md`
- **Quick Start**: `INTELLIGENCE_QUICK_START.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **This File**: `INTELLIGENCE_REFERENCE.md`

## 🎯 Best Practices

1. **Let it learn naturally** - Just chat normally
2. **End conversations** - Triggers full analysis
3. **Check profile regularly** - See what's learned
4. **Analyze all once** - Process existing data
5. **Be consistent** - Patterns emerge over time

## 🔐 Privacy

- ✅ Data stays local + your database
- ✅ No sharing between users
- ✅ Can reset anytime
- ✅ No PII collected
- ❌ Not sent to third parties

---

**Quick Reference v1.0** | For ChattyAI Intelligence System
