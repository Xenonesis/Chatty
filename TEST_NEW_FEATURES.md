# 🧪 Testing Guide for New Features

This guide will help you test all the newly implemented features.

## Prerequisites

Before testing, ensure you have:

1. ✅ Run database migration: `python manage.py migrate`
2. ✅ Installed reportlab: `pip install reportlab`
3. ✅ Backend running: `python manage.py runserver`
4. ✅ Frontend running: `npm run dev`
5. ✅ At least one conversation with messages in the database

---

## 🎯 Feature Testing Checklist

### 1. ✅ Analytics Dashboard

**How to Test:**
1. Open the application
2. Click the **Analytics** button (📊) in the navigation bar
3. You should see the analytics dashboard with:
   - Summary cards (conversations, messages, duration, bookmarks)
   - Most active days chart
   - Message distribution
   - Status distribution
   - Daily activity

**Expected Result:**
- Dashboard loads with data from your conversations
- Can change time period (7, 30, 90 days)
- Charts display properly

**Screenshot Locations:**
- Main view with summary cards
- Charts and visualizations

---

### 2. 🎤 Voice Input

**How to Test:**
1. Go to the chat interface
2. Look for the **microphone button** (🎤) next to the message input
3. Click the microphone button
4. Speak into your microphone
5. Your speech should appear as text in the input field

**Browser Requirements:**
- Chrome, Edge, or Safari (Firefox not supported)
- HTTPS or localhost
- Microphone permissions granted

**Expected Result:**
- Microphone button changes color when listening
- Speech appears as text in real-time
- Can click again to stop listening

---

### 3. 🔊 Voice Output

**How to Test:**
1. Send a message to the AI
2. When the AI responds, it should automatically speak the response
3. A **Stop** button (🔇) should appear while speaking
4. Click Stop to interrupt the speech

**Expected Result:**
- AI responses are spoken aloud
- Can stop speech mid-sentence
- Voice quality is clear

**To Disable Auto-Speak:**
Comment out the auto-speak code in `ChatInterface.tsx` (lines 326-337)

---

### 4. 📥 Export Conversation

**How to Test:**

#### Export as JSON
1. Open a conversation with messages
2. Click the **Export** button in the header
3. Select **Export as JSON**
4. A JSON file should download
5. Open the file - you should see structured conversation data

#### Export as Markdown
1. Click **Export** → **Export as Markdown**
2. A `.md` file should download
3. Open in a text editor or Markdown viewer
4. Should see formatted conversation with emoji

#### Export as PDF
1. Click **Export** → **Export as PDF**
2. A PDF file should download
3. Open the PDF - should see professionally formatted conversation

**Expected Result:**
- All three formats download successfully
- Files contain complete conversation data
- Formatting is correct and readable

---

### 5. 🔗 Conversation Sharing

**How to Test:**
1. Open a conversation with messages
2. Click the **Share** button
3. A dialog should open with a shareable link
4. Click **Copy** to copy the link
5. Open the link in an **incognito/private window** (to simulate another user)
6. You should see a read-only view of the conversation

**Test the Shared View:**
- Conversation title and metadata visible
- All messages display correctly
- Summary shows (if generated)
- Expiration notice displays
- No edit/delete buttons (read-only)

**URL Format:**
```
http://localhost:3000/shared/abc-123-def-456
```

**Expected Result:**
- Link generates successfully
- Can be accessed without authentication
- Read-only view works properly
- Expires after 7 days (default)

---

### 6. ❤️ Message Reactions

**How to Test:**
1. Hover over any message in the chat
2. Message actions should appear
3. Click the **heart icon** (❤️) to open reactions menu
4. Select a reaction:
   - 👍 Like
   - ❤️ Love
   - 😂 Funny
   - 👎 Dislike
5. The reaction should appear above the message
6. Click the same reaction again to increment the count

**Expected Result:**
- Reactions menu opens
- Reaction appears immediately
- Count increments properly
- Persists after page reload

---

### 7. 🔖 Message Bookmarking

**How to Test:**
1. Hover over any message
2. Click the **bookmark icon** (🔖)
3. Icon should fill with color (yellow)
4. Click again to remove bookmark
5. Reload the page - bookmarks should persist

**Expected Result:**
- Bookmark icon fills when active
- Can toggle on/off
- Persists in database
- Shows in analytics count

**Future Enhancement:**
Add a bookmarks filter view to see all bookmarked messages

---

### 8. 🧵 Message Threading (Backend Ready)

**API Testing:**
```bash
# Create a reply to message ID 123
curl -X POST http://localhost:8000/api/messages/123/reply/ \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a reply to the original message",
    "sender": "user"
  }'
```

**Expected Result:**
- Reply message created with parent_message = 123
- Can query replies: `GET /api/messages/?parent_message=123`

**Frontend Integration Needed:**
The backend is ready, but you'll need to add UI to:
- Display thread indicators
- Show replies in a nested view
- Add "Reply" button to messages

---

## 🔍 Testing Workflow Example

### Complete Feature Test Flow

1. **Start Fresh:**
   ```bash
   # Create a test conversation
   curl -X POST http://localhost:8000/api/conversations/ \
     -H "Content-Type: application/json" \
     -d '{"title": "Feature Test Conversation"}'
   ```

2. **Add Messages:**
   - Use the chat interface to send several messages
   - Get AI responses

3. **Test Reactions:**
   - Add reactions to 2-3 messages
   - Try different reaction types

4. **Test Bookmarks:**
   - Bookmark 1-2 important messages

5. **Test Voice:**
   - Use voice input to send a message
   - Listen to AI response

6. **Test Export:**
   - Export as PDF
   - Verify content is complete

7. **Test Sharing:**
   - Create share link
   - Open in incognito
   - Verify read-only access

8. **Check Analytics:**
   - Go to analytics dashboard
   - Verify all data appears correctly

---

## 🐛 Troubleshooting

### Voice Input Not Working

**Issue:** Microphone button doesn't appear

**Solutions:**
- Ensure you're on Chrome, Edge, or Safari
- Check that you're using HTTPS or localhost
- Grant microphone permissions in browser settings
- Check browser console for errors

### Export Fails

**Issue:** PDF export returns 500 error

**Solutions:**
```bash
pip install reportlab
python manage.py runserver  # Restart server
```

### Analytics Shows No Data

**Issue:** Dashboard is empty

**Solutions:**
- Create some conversations with messages
- Check that messages have timestamps
- Verify backend API: `http://localhost:8000/api/analytics/trends/`
- Check browser console for errors

### Share Link Doesn't Work

**Issue:** 404 error when accessing shared link

**Solutions:**
- Ensure the route exists: `app/shared/[token]/page.tsx`
- Check that the link hasn't expired
- Verify token is correct
- Check backend cache is working

### Reactions/Bookmarks Not Persisting

**Issue:** Disappear on page reload

**Solutions:**
- Run migration: `python manage.py migrate`
- Check that Message model has new fields
- Verify API responses include reactions and is_bookmarked
- Check browser console for API errors

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Analytics dashboard loads and shows data
- [ ] Voice input captures speech correctly
- [ ] Voice output speaks AI responses
- [ ] Can export to JSON, Markdown, and PDF
- [ ] Share links work in incognito window
- [ ] Reactions appear and persist
- [ ] Bookmarks toggle and persist
- [ ] All features work on page reload
- [ ] No console errors
- [ ] Mobile responsive (test on phone/tablet)

---

## 📊 Expected Database State

After testing, your database should have:

```sql
-- Check messages have new fields
SELECT id, content, reactions, is_bookmarked, parent_message 
FROM chat_message 
LIMIT 5;

-- Count bookmarked messages
SELECT COUNT(*) FROM chat_message WHERE is_bookmarked = true;

-- Check reactions
SELECT reactions FROM chat_message WHERE reactions != '{}';
```

---

## 🎉 Success Criteria

All features are working if:

1. ✅ Analytics shows accurate data
2. ✅ Voice input transcribes speech
3. ✅ Voice output speaks responses
4. ✅ All three export formats download
5. ✅ Shared links work in private browsing
6. ✅ Reactions display and increment
7. ✅ Bookmarks toggle and persist
8. ✅ No console errors
9. ✅ No backend errors
10. ✅ All data persists on reload

---

## 📹 Video Demo Script

To create a demo video:

1. **Introduction (30s)**
   - Show main chat interface
   - Highlight new features in navigation

2. **Analytics (1 min)**
   - Click Analytics button
   - Show charts and metrics
   - Change time period

3. **Voice Features (1 min)**
   - Use voice input
   - Show AI response with voice output
   - Demonstrate Stop button

4. **Export (1 min)**
   - Export conversation as PDF
   - Open and show formatted document
   - Quick show of JSON/Markdown

5. **Sharing (1 min)**
   - Create share link
   - Copy and open in new window
   - Show read-only view

6. **Engagement (1 min)**
   - Add reactions to messages
   - Bookmark important messages
   - Show reactions display

7. **Conclusion (30s)**
   - Recap all features
   - Show analytics with new data

**Total: ~6 minutes**

---

## 🚀 Next Steps After Testing

Once all features are tested and working:

1. **Document any issues** encountered
2. **Create user documentation** if needed
3. **Set up production environment** (Redis cache for sharing)
4. **Configure backup strategy** for conversation data
5. **Monitor analytics** for usage patterns
6. **Plan future enhancements:**
   - Thread visualization UI
   - Bookmarks filter view
   - Reaction animations
   - Export scheduling

---

**Happy Testing! 🎊**

If you find any issues, check the documentation files or review the component source code for implementation details.
