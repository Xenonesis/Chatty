# Troubleshooting Guide

## API Key Issues

### "Google API key not configured" Error (or similar for other providers)

**Problem:** You saved your API key in the AI Settings UI, but you're still getting an error that the API key is not configured.

**Root Cause:** Prior to the fix, API keys were only stored in memory and would be lost when the backend server restarted.

**Solution:** The issue has been fixed! API keys are now automatically saved to the `.env` file when you configure them through the UI. However, if you're still experiencing this issue:

1. **Check if `.env` file exists in the project root:**
   ```bash
   # Windows (PowerShell)
   Test-Path .env
   
   # If it doesn't exist, create it from the example:
   Copy-Item .env.example .env
   ```

2. **Verify the API key is in the `.env` file:**
   Open `.env` and check for your provider's key:
   ```env
   GOOGLE_API_KEY=your-actual-api-key-here
   AI_PROVIDER=google
   AI_MODEL=gemini-pro
   ```

3. **Restart the backend server:**
   ```bash
   # Stop the current server (Ctrl+C) and restart:
   cd backend
   python manage.py runserver
   ```

4. **Alternative: Set the key manually in `.env`:**
   If the UI save isn't working, you can manually add your key to the `.env` file:
   ```env
   GOOGLE_API_KEY=your-api-key-here
   ANTHROPIC_API_KEY=your-anthropic-key-here
   OPENAI_API_KEY=your-openai-key-here
   ```

### API Key Permissions

**Problem:** API key is configured but requests fail with authentication errors.

**Solution:**
- Verify the API key is valid and hasn't expired
- Check that the API key has the necessary permissions for the service
- For Google/Gemini: Ensure the Generative Language API is enabled in your Google Cloud Console
- For OpenAI: Verify your account has credits and the key has the right scopes
- For Anthropic: Check your API key is from the correct organization

## Database Issues

### "No such table" Errors

**Problem:** Getting database errors about missing tables.

**Solution:**
```bash
cd backend
python manage.py migrate
```

### Database Locked (SQLite)

**Problem:** "Database is locked" error when using SQLite.

**Solution:**
- Close any other processes accessing the database
- Consider switching to PostgreSQL for production use
- Set `USE_SQLITE=False` in `.env` and configure PostgreSQL

## Port Already in Use

**Problem:** "Port 8000 is already in use" or "Port 3000 is already in use"

**Solution:**

**Windows (PowerShell):**
```powershell
# Find and kill process on port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

# Or use the provided script:
node kill_ports.js
```

**Linux/Mac:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## CORS Errors

**Problem:** Frontend can't connect to backend due to CORS errors.

**Solution:**
1. Check `CORS_ALLOWED_ORIGINS` in `.env`:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

2. Ensure the frontend is using the correct API URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. Restart both frontend and backend servers

## Module Not Found Errors

### Backend (Python)

**Problem:** `ModuleNotFoundError` when running Django.

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Frontend (Node.js)

**Problem:** Module not found errors in Next.js.

**Solution:**
```bash
npm install
# or
npm ci  # for clean install
```

## AI Provider Connection Issues

### LM Studio Not Connecting

**Problem:** Can't connect to LM Studio.

**Solution:**
1. Ensure LM Studio is running
2. Check that a model is loaded in LM Studio
3. Verify the base URL in `.env`:
   ```env
   LM_STUDIO_BASE_URL=http://localhost:1234/v1
   ```
4. Test the connection:
   ```bash
   curl http://localhost:1234/v1/models
   ```

### Ollama Not Connecting

**Problem:** Can't connect to Ollama.

**Solution:**
1. Ensure Ollama is running:
   ```bash
   ollama serve
   ```
2. Verify the base URL in `.env`:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   ```
3. Test the connection:
   ```bash
   curl http://localhost:11434/api/tags
   ```

## Environment Variables Not Loading

**Problem:** Changes to `.env` file are not being picked up.

**Solution:**
1. Ensure the `.env` file is in the correct location (project root)
2. Restart the backend server completely (stop and start, not just reload)
3. Check for typos in variable names
4. Ensure there are no spaces around the `=` sign:
   ```env
   # Correct:
   API_KEY=value
   
   # Incorrect:
   API_KEY = value
   ```

## Getting More Help

If you're still experiencing issues:

1. Check the console logs in your browser's Developer Tools (F12)
2. Check the backend server logs in the terminal
3. Review the [README.md](README.md) for setup instructions
4. Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
5. Open an issue on GitHub with:
   - Error messages (with sensitive data removed)
   - Steps to reproduce
   - Your environment (OS, Python version, Node version)
