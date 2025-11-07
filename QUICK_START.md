# 🚀 Quick Start Guide - AI Chat Portal

Get up and running in 10 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.9+)
python --version

# Check Node.js version (need 18+)
node --version

# Check PostgreSQL (need 12+)
psql --version

# Check npm
npm --version
```

All installed? Let's go! 👇

## Step 1: Database Setup (2 minutes)

```bash
# Create database
createdb chatportal_db

# Or using psql:
psql -U postgres
CREATE DATABASE chatportal_db;
\q
```

## Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Edit .env - Set these minimum values:
# DB_NAME=chatportal_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# AI_PROVIDER=lmstudio

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Create sample data (optional)
python manage.py create_sample_data

# Start backend
python manage.py runserver
```

✅ Backend running at http://localhost:8000

## Step 3: Frontend Setup (3 minutes)

```bash
# Open NEW terminal, go to project root
cd ..

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local

# .env.local should contain:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:3000

## Step 4: AI Provider Setup (2 minutes)

### Option A: LM Studio (Local, Free)
1. Download from https://lmstudio.ai/
2. Install and open LM Studio
3. Download a model (e.g., "Phi-2" - small and fast)
4. Click "Local Server" tab
5. Select your model
6. Click "Start Server"

✅ AI ready at http://localhost:1234

### Option B: OpenAI (Cloud, Paid)
1. Get API key from https://platform.openai.com/
2. Edit `backend/.env`:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   AI_MODEL=gpt-3.5-turbo
   ```
3. Restart backend

## Step 5: Test It! (1 minute)

1. Open http://localhost:3000
2. Click "New Chat"
3. Type: "Hello! What can you help me with?"
4. Press Send
5. Wait for AI response

🎉 **You're done! Start chatting!**

## Quick Commands Reference

### Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver      # Start server
python manage.py migrate         # Run migrations
python manage.py createsuperuser # Create admin
python manage.py test           # Run tests
```

### Frontend
```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Production server
npm run lint   # Check code quality
```

### Database
```bash
psql -U postgres -d chatportal_db  # Connect to DB
python manage.py dbshell           # Django DB shell
```

## Common Issues & Fixes

### "Connection refused" error
- ✅ Check backend is running on port 8000
- ✅ Check frontend .env.local has correct API URL

### "Database connection failed"
- ✅ Verify PostgreSQL is running
- ✅ Check database name and credentials in .env

### "AI not responding"
- ✅ Check AI provider is configured in .env
- ✅ If using LM Studio, ensure server is running
- ✅ If using OpenAI, verify API key is valid

### "Module not found"
- ✅ Backend: `pip install -r requirements.txt`
- ✅ Frontend: `npm install`

## What's Next?

### Explore Features
- 💬 **Chat Tab**: Start conversations with AI
- 📚 **Conversations Tab**: Browse your chat history
- 🧠 **Intelligence Tab**: Query your conversations

### Read Documentation
- 📖 **SETUP_GUIDE.md**: Detailed setup instructions
- 📖 **API_DOCUMENTATION.md**: API reference
- 📖 **FEATURES.md**: Complete feature list
- 📖 **ARCHITECTURE.md**: System design
- 📖 **DEPLOYMENT.md**: Production deployment

### Admin Panel
- Visit http://localhost:8000/admin/
- Login with your superuser credentials
- View and manage conversations and messages

## Testing Checklist

- [ ] Can create new conversation
- [ ] Can send message and get AI response
- [ ] Can view conversation history
- [ ] Can end conversation and get summary
- [ ] Can search conversations
- [ ] Can query about past conversations

All working? **Congratulations!** 🎊

## Need Help?

1. Check the error message in terminal
2. Look in the documentation files
3. Verify all services are running
4. Check the SETUP_GUIDE.md for detailed troubleshooting

## Architecture at a Glance

```
Browser (localhost:3000)
    ↓
Next.js Frontend
    ↓
REST API (localhost:8000/api)
    ↓
Django Backend
    ↓
PostgreSQL Database + AI Provider
```

## Project Structure

```
ai-chat-portal/
├── backend/           # Django REST API
│   ├── config/       # Settings
│   ├── chat/         # Main app
│   └── manage.py     # Django CLI
├── app/              # Next.js pages
├── components/       # React components
├── lib/              # Utilities
└── *.md             # Documentation
```

## Environment Variables Summary

### Backend (.env)
```env
DB_NAME=chatportal_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key
DEBUG=True
AI_PROVIDER=lmstudio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Production Deployment

When ready for production:
1. Read **DEPLOYMENT.md**
2. Set `DEBUG=False` in backend .env
3. Generate secure `SECRET_KEY`
4. Use production database
5. Deploy backend to server
6. Deploy frontend to Vercel/Netlify
7. Configure CORS properly

## Support

- 📖 Read the documentation files
- 🔍 Check error logs
- ✅ Follow the TEST_VERIFICATION.md checklist

---

**Ready to build amazing AI conversations!** 🚀

Time to completion: ~10 minutes ⏱️
Difficulty: Easy 😊
