# Complete Setup Guide - AI Chat Portal

This guide will walk you through setting up the entire application from scratch.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [PostgreSQL Setup](#postgresql-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Required Software

- **Python 3.9 or higher**
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/

- **Node.js 18 or higher**
  - Check: `node --version`
  - Download: https://nodejs.org/

- **PostgreSQL 12 or higher**
  - Check: `psql --version`
  - Download: https://www.postgresql.org/download/

- **npm** (comes with Node.js)
  - Check: `npm --version`

- **Git** (optional but recommended)
  - Check: `git --version`
  - Download: https://git-scm.com/

### Operating System

Works on:
- ✅ Linux (Ubuntu, Debian, etc.)
- ✅ macOS
- ✅ Windows 10/11

## PostgreSQL Setup

### Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Windows
1. Download installer from https://www.postgresql.org/download/windows/
2. Run installer and follow instructions
3. Remember the password you set for the postgres user

### Database Configuration

1. **Access PostgreSQL:**

```bash
# Ubuntu/Mac
sudo -u postgres psql

# Windows (use SQL Shell from Start Menu)
psql -U postgres
```

2. **Create Database and User:**

```sql
-- Create database
CREATE DATABASE chatportal_db;

-- Create user
CREATE USER chatportal_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
ALTER ROLE chatportal_user SET client_encoding TO 'utf8';
ALTER ROLE chatportal_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE chatportal_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE chatportal_db TO chatportal_user;

-- Exit
\q
```

3. **Verify Connection:**

```bash
psql -U chatportal_user -d chatportal_db -h localhost
# Enter the password when prompted
# If successful, you'll see the psql prompt
\q
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Your prompt should now show (venv)
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- Django 5.0.1
- Django REST Framework 3.14.0
- PostgreSQL adapter (psycopg2-binary)
- AI provider libraries (OpenAI, Anthropic, Google Generative AI)
- Other dependencies

### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit the file
# On Linux/Mac:
nano .env

# On Windows:
notepad .env
```

**Edit `.env` with your settings:**

```env
# Database Configuration
DB_NAME=chatportal_db
DB_USER=chatportal_user
DB_PASSWORD=your_secure_password_here
DB_HOST=localhost
DB_PORT=5432

# Django Settings
SECRET_KEY=your-long-random-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AI Provider (choose one)
AI_PROVIDER=lmstudio
AI_MODEL=local-model

# LM Studio Configuration (if using)
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio

# Or use cloud providers:
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_API_KEY=...

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Generate a secure SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Run Database Migrations

```bash
# Create migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# You should see:
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying chat.0001_initial... OK
#   ...
```

### 6. Create Superuser (Admin Account)

```bash
python manage.py createsuperuser

# Enter username, email, and password when prompted
# Example:
# Username: admin
# Email: admin@example.com
# Password: (enter secure password)
```

### 7. Create Sample Data (Optional)

```bash
python manage.py create_sample_data
```

### 8. Test Backend

```bash
# Run development server
python manage.py runserver

# You should see:
# Starting development server at http://127.0.0.1:8000/
```

Visit http://localhost:8000/admin/ and login with your superuser credentials.

**Keep this terminal running!**

## Frontend Setup

### 1. Open New Terminal

Open a new terminal/command prompt for the frontend (keep backend running).

### 2. Navigate to Project Root

```bash
# If you were in backend directory:
cd ..

# You should be in the project root now
```

### 3. Install Dependencies

```bash
npm install

# This will install all Node.js dependencies
# It may take a few minutes
```

### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local

# Edit the file
# On Linux/Mac:
nano .env.local

# On Windows:
notepad .env.local
```

**Edit `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 5. Run Frontend

```bash
npm run dev

# You should see:
# ▲ Next.js 16.0.1
# - Local:        http://localhost:3000
```

## Configuration

### AI Provider Setup

#### Option 1: LM Studio (Recommended for Privacy)

1. **Download LM Studio:**
   - Visit https://lmstudio.ai/
   - Download for your OS
   - Install the application

2. **Load a Model:**
   - Open LM Studio
   - Go to "Discover" tab
   - Search for models (e.g., "Llama 2", "Mistral", "Phi-2")
   - Download a model (smaller models like Phi-2 work on most systems)

3. **Start Local Server:**
   - Go to "Local Server" tab in LM Studio
   - Select your downloaded model
   - Click "Start Server"
   - Server will start on http://localhost:1234

4. **Configure Backend:**
   Already configured in `.env` if you used the example above.

#### Option 2: OpenAI

1. Get API key from https://platform.openai.com/
2. Update `backend/.env`:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4
```

#### Option 3: Anthropic Claude

1. Get API key from https://www.anthropic.com/
2. Update `backend/.env`:
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_MODEL=claude-3-opus-20240229
```

#### Option 4: Google Gemini

1. Get API key from https://makersuite.google.com/
2. Update `backend/.env`:
```env
AI_PROVIDER=google
GOOGLE_API_KEY=your-key-here
AI_MODEL=gemini-pro
```

## Running the Application

### Start Both Servers

You need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8000/api/
3. **Admin Panel:** http://localhost:8000/admin/

## Testing

### Test Backend

```bash
cd backend
source venv/bin/activate
python manage.py test

# Run specific test
python manage.py test chat.tests.ConversationModelTest
```

### Test API Endpoints

Using curl:

```bash
# List conversations
curl http://localhost:8000/api/conversations/

# Create conversation
curl -X POST http://localhost:8000/api/conversations/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Conversation"}'
```

### Test Frontend

Open http://localhost:3000 in your browser and:

1. Click "Chat" tab
2. Click "New Chat"
3. Type a message and send
4. Verify AI responds
5. Click "Conversations" to see history
6. Click "Intelligence" to query past conversations

## Troubleshooting

### Backend Issues

**Issue: `psycopg2` installation fails**

Solution:
```bash
# Ubuntu/Debian
sudo apt-get install libpq-dev python3-dev

# macOS
brew install postgresql

# Then reinstall
pip install psycopg2-binary
```

**Issue: Database connection error**

Solution:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Test connection: `psql -U chatportal_user -d chatportal_db -h localhost`

**Issue: Migrations fail**

Solution:
```bash
# Reset migrations (CAUTION: deletes all data)
python manage.py migrate chat zero
python manage.py migrate

# Or drop and recreate database
psql -U postgres
DROP DATABASE chatportal_db;
CREATE DATABASE chatportal_db;
\q
python manage.py migrate
```

**Issue: AI responses not working**

Solution:
- Check AI provider configuration in `.env`
- Verify API keys are correct
- If using LM Studio, ensure server is running
- Check backend logs for errors

### Frontend Issues

**Issue: `npm install` fails**

Solution:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: API calls fail with CORS error**

Solution:
- Verify backend is running on port 8000
- Check `CORS_ALLOWED_ORIGINS` in `backend/.env`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Issue: Port 3000 already in use**

Solution:
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### General Issues

**Issue: "Module not found" errors**

Solution:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
npm install
```

**Issue: Changes not reflecting**

Solution:
```bash
# Backend: Restart server (Ctrl+C, then python manage.py runserver)
# Frontend: Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps

1. ✅ Application is running
2. 📝 Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
3. 🏗️ Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
5. 🎨 Customize the UI in `components/` directory
6. 🤖 Experiment with different AI providers
7. 📊 Add more conversation intelligence features

## Getting Help

- Check documentation files in the project
- Review Django and Next.js official docs
- Check console logs for error messages
- Verify all services are running

**Enjoy your AI Chat Portal! 🚀**
