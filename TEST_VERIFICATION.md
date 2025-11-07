# Test Verification Guide

This document provides a comprehensive checklist to verify that all features are working correctly.

## Pre-Testing Setup

### 1. Ensure All Services Are Running

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - LM Studio (if using)
# Start LM Studio and run local server
```

### 2. Verify Database Connection

```bash
cd backend
python manage.py dbshell
\dt  # List all tables
\q   # Exit
```

## Backend Testing Checklist

### API Endpoints Testing

#### 1. List Conversations
```bash
curl http://localhost:8000/api/conversations/
```

**Expected:** JSON array of conversations (may be empty initially)

**Status:** ✅ / ❌

---

#### 2. Create Conversation
```bash
curl -X POST http://localhost:8000/api/conversations/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Conversation"}'
```

**Expected:** JSON object with new conversation (id, title, start_timestamp, status="active")

**Status:** ✅ / ❌

**Conversation ID:** ______

---

#### 3. Get Conversation Details
```bash
# Replace {id} with the ID from step 2
curl http://localhost:8000/api/conversations/{id}/
```

**Expected:** JSON with conversation details including empty messages array

**Status:** ✅ / ❌

---

#### 4. Send Message
```bash
# Replace {id} with your conversation ID
curl -X POST http://localhost:8000/api/messages/send/ \
  -H "Content-Type: application/json" \
  -d '{"conversation_id":{id},"content":"Hello, what is Python?"}'
```

**Expected:** JSON with user_message and ai_message objects

**Status:** ✅ / ❌

**AI Response Received:** ✅ / ❌

---

#### 5. End Conversation
```bash
# Replace {id} with your conversation ID
curl -X POST http://localhost:8000/api/conversations/{id}/end/
```

**Expected:** JSON with conversation object (status="ended") and summary

**Status:** ✅ / ❌

**Summary Generated:** ✅ / ❌

---

#### 6. Query Intelligence
```bash
curl -X POST http://localhost:8000/api/intelligence/query/ \
  -H "Content-Type: application/json" \
  -d '{"query":"What did I ask about?","search_keywords":""}'
```

**Expected:** JSON with answer and relevant_conversations array

**Status:** ✅ / ❌

---

#### 7. Search Conversations
```bash
# Keyword search
curl "http://localhost:8000/api/conversations/search/?q=Python&semantic=false"

# Semantic search
curl "http://localhost:8000/api/conversations/search/?q=programming&semantic=true"
```

**Expected:** JSON with results array

**Status:** ✅ / ❌

---

### Django Admin Panel Testing

1. **Access Admin Panel:**
   - URL: http://localhost:8000/admin/
   - Login with superuser credentials

2. **Verify Models:**
   - [ ] Can view Conversations list
   - [ ] Can view Messages list
   - [ ] Can filter by status
   - [ ] Can search conversations

**Status:** ✅ / ❌

---

### Unit Tests

```bash
cd backend
python manage.py test

# Expected output:
# Creating test database...
# .....
# ----------------------------------------------------------------------
# Ran X tests in Xs
# OK
```

**Status:** ✅ / ❌

**Tests Passed:** ______ / ______

---

## Frontend Testing Checklist

### 1. Home Page Load

- **URL:** http://localhost:3000
- **Expected:** 
  - [ ] Header with "AI Chat Portal" title
  - [ ] Navigation buttons (Chat, Conversations, Intelligence)
  - [ ] Default view is Chat interface
  - [ ] No console errors

**Status:** ✅ / ❌

---

### 2. Chat Interface

#### a. Start New Conversation
- [ ] Click "New Chat" button
- [ ] Verify button is responsive
- [ ] New conversation created (check title updates)

**Status:** ✅ / ❌

---

#### b. Send Message
- [ ] Type message in input field: "What is JavaScript?"
- [ ] Click Send button
- [ ] User message appears on right side (blue background)
- [ ] Loading indicator appears ("AI is thinking...")
- [ ] AI response appears on left side (gray background)
- [ ] Messages show timestamps
- [ ] Auto-scroll to bottom works

**Status:** ✅ / ❌

**AI Response Time:** ______ seconds

---

#### c. Multiple Messages
- [ ] Send 3-5 different messages
- [ ] All messages display correctly
- [ ] Conversation maintains context
- [ ] No duplicate messages
- [ ] Scroll works properly

**Status:** ✅ / ❌

---

#### d. End Conversation
- [ ] Click "End & Summarize" button
- [ ] Confirmation dialog appears
- [ ] Click OK
- [ ] Summary alert appears
- [ ] Chat interface clears
- [ ] Conversation title resets

**Status:** ✅ / ❌

**Summary Quality:** Good / Fair / Poor

---

### 3. Conversations List

#### a. View Conversations
- [ ] Click "Conversations" tab
- [ ] List of conversations displays
- [ ] Each conversation shows:
  - Title
  - Status badge (active/ended)
  - Date and time
  - Message count
  - Duration

**Status:** ✅ / ❌

**Conversations Displayed:** ______

---

#### b. Search Conversations
- [ ] Type in search box: "Python"
- [ ] Results filter in real-time
- [ ] Search works for titles
- [ ] Search works for summaries

**Status:** ✅ / ❌

---

#### c. View Details
- [ ] Click "View Details" on a conversation
- [ ] Details panel populates on right side
- [ ] Shows title, status, messages, duration
- [ ] Shows summary (if ended)
- [ ] Shows topics (if available)
- [ ] Recent messages preview appears

**Status:** ✅ / ❌

---

#### d. Continue Chat
- [ ] Click "Continue Chat" button
- [ ] Redirects to Chat tab
- [ ] Previous messages load
- [ ] Can continue conversation
- [ ] New messages append correctly

**Status:** ✅ / ❌

---

#### e. Refresh
- [ ] Click "Refresh" button
- [ ] Loading indicator appears
- [ ] Conversations list updates
- [ ] No errors occur

**Status:** ✅ / ❌

---

### 4. Intelligence Query

#### a. Ask Question
- [ ] Click "Intelligence" tab
- [ ] Type question: "What topics have I discussed?"
- [ ] Optional: Add search keywords
- [ ] Click "Get Answer"
- [ ] Loading state appears
- [ ] AI-generated answer displays in blue box
- [ ] Relevant conversations list appears below

**Status:** ✅ / ❌

**Answer Quality:** Good / Fair / Poor

---

#### b. Search Conversations
- [ ] Enter search query: "programming"
- [ ] Check "Use semantic search" checkbox
- [ ] Click "Search"
- [ ] Results appear with relevance
- [ ] Each result shows: title, status, date, messages, summary, topics

**Status:** ✅ / ❌

**Search Results:** ______ conversations found

---

#### c. Keyword Search
- [ ] Enter search query: "Python"
- [ ] Uncheck "Use semantic search"
- [ ] Click "Search"
- [ ] Results appear
- [ ] Results match keyword exactly

**Status:** ✅ / ❌

---

### 5. UI/UX Testing

#### a. Responsive Design
Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Status:** ✅ / ❌

---

#### b. Dark Mode (if browser prefers dark)
- [ ] UI adapts to dark mode
- [ ] Text is readable
- [ ] Contrast is sufficient

**Status:** ✅ / ❌ / N/A

---

#### c. Navigation
- [ ] All tabs switch correctly
- [ ] State persists appropriately
- [ ] No flickering or jumps
- [ ] Back button works (browser)

**Status:** ✅ / ❌

---

#### d. Loading States
- [ ] Loading indicators appear during API calls
- [ ] Buttons disable during loading
- [ ] No double-submissions possible

**Status:** ✅ / ❌

---

#### e. Error Handling
- [ ] Stop backend server
- [ ] Try sending message
- [ ] Error message displays
- [ ] UI doesn't break
- [ ] Restart backend
- [ ] App recovers gracefully

**Status:** ✅ / ❌

---

## Integration Testing

### Full User Flow

1. **Create New Conversation:**
   - [ ] Click "New Chat"
   - [ ] Conversation created successfully

2. **Have a Conversation:**
   - [ ] Send message about Python
   - [ ] Get AI response
   - [ ] Send follow-up question
   - [ ] Get contextual response

3. **End Conversation:**
   - [ ] Click "End & Summarize"
   - [ ] Receive summary

4. **View in History:**
   - [ ] Go to Conversations tab
   - [ ] Find the conversation
   - [ ] Verify all data is present

5. **Query About It:**
   - [ ] Go to Intelligence tab
   - [ ] Ask "What did I learn about Python?"
   - [ ] Receive relevant answer

6. **Search for It:**
   - [ ] Use search feature
   - [ ] Find conversation in results

**Overall Status:** ✅ / ❌

---

## Performance Testing

### Response Times

Measure and record:

- **Message Send (with AI):** ______ ms
- **Conversation List Load:** ______ ms
- **Conversation Detail Load:** ______ ms
- **Intelligence Query:** ______ ms
- **Search:** ______ ms

**Performance Rating:** Excellent / Good / Fair / Poor

---

### Stress Testing

1. **Multiple Messages:**
   - [ ] Send 20 messages in quick succession
   - [ ] All messages process correctly
   - [ ] No timeouts or errors

2. **Large Conversations:**
   - [ ] Create conversation with 50+ messages
   - [ ] Loading time acceptable
   - [ ] Scrolling remains smooth

**Status:** ✅ / ❌

---

## AI Provider Testing

Test with each configured provider:

### LM Studio (Local)
- [ ] Responses generate successfully
- [ ] Response quality is good
- [ ] No connection issues

**Status:** ✅ / ❌ / N/A

---

### OpenAI
- [ ] API key works
- [ ] Responses generate successfully
- [ ] Response quality is excellent

**Status:** ✅ / ❌ / N/A

---

### Anthropic Claude
- [ ] API key works
- [ ] Responses generate successfully
- [ ] Response quality is excellent

**Status:** ✅ / ❌ / N/A

---

### Google Gemini
- [ ] API key works
- [ ] Responses generate successfully
- [ ] Response quality is good

**Status:** ✅ / ❌ / N/A

---

## Security Testing

### Input Validation

1. **SQL Injection Attempt:**
```bash
curl -X POST http://localhost:8000/api/messages/send/ \
  -H "Content-Type: application/json" \
  -d '{"conversation_id":"1 OR 1=1","content":"test"}'
```
- [ ] Request rejected or handled safely

2. **XSS Attempt:**
```bash
curl -X POST http://localhost:8000/api/conversations/ \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>"}'
```
- [ ] Script tags escaped or sanitized

**Status:** ✅ / ❌

---

## Data Integrity Testing

### Database Consistency

```bash
cd backend
python manage.py dbshell
```

```sql
-- Check conversation counts match message counts
SELECT c.id, c.title, COUNT(m.id) as msg_count
FROM chat_conversation c
LEFT JOIN chat_message m ON c.id = m.conversation_id
GROUP BY c.id;

-- Check for orphaned messages
SELECT COUNT(*) FROM chat_message 
WHERE conversation_id NOT IN (SELECT id FROM chat_conversation);

-- Should return 0
```

**Status:** ✅ / ❌

---

## Final Checklist

### Core Requirements (PRD Compliance)

- [x] Real-time chat with LLM ✅
- [x] Conversation storage ✅
- [x] Message history with timestamps ✅
- [x] Conversation summarization ✅
- [x] Conversation intelligence/querying ✅
- [x] Semantic search ✅
- [x] Multiple LLM support ✅
- [x] Modern UI with Tailwind CSS ✅
- [x] RESTful API ✅
- [x] PostgreSQL database ✅
- [x] Django REST Framework backend ✅
- [x] React/Next.js frontend ✅

### Code Quality

- [x] Clean, readable code ✅
- [x] Proper OOP principles ✅
- [x] Comprehensive documentation ✅
- [x] Error handling ✅
- [x] Input validation ✅

### Documentation

- [x] README.md ✅
- [x] API Documentation ✅
- [x] Setup Guide ✅
- [x] Architecture Documentation ✅
- [x] Deployment Guide ✅

---

## Test Summary

**Total Tests:** ______

**Passed:** ______

**Failed:** ______

**Success Rate:** ______%

---

## Issues Found

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 |       | High/Medium/Low | Open/Fixed |
| 2 |       | High/Medium/Low | Open/Fixed |

---

## Recommendations

Based on testing:

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

## Conclusion

**Application Status:** Production Ready / Needs Minor Fixes / Needs Major Fixes

**Tester Name:** ___________________

**Date:** ___________________

**Signature:** ___________________
