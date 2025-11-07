# 📦 NPM Scripts Documentation

This document explains all the npm scripts available in this project.

## 🚀 Main Development Command

### `npm run dev`
**The main command to start the entire application.**

```bash
npm run dev
```

**What it does:**
1. Runs `npm run kill:ports` to clear ports 3000 and 8000
2. Runs `npm run setup:backend` to prepare the Python environment
3. Starts both servers concurrently with color-coded output:
   - 🟦 **Backend** (Django) on `http://localhost:8000`
   - 🟩 **Frontend** (Next.js) on `http://localhost:3000`
4. Shows logs from both servers in real-time
5. Stops both servers when you press `Ctrl+C`

**First Time Setup:**
```bash
npm install      # Install Node.js dependencies
npm run dev      # Will automatically set up backend environment
```

---

## 🔧 Individual Scripts

### `npm run dev:frontend`
Starts only the Next.js frontend development server.

```bash
npm run dev:frontend
```

- Runs on `http://localhost:3000`
- Hot reload enabled
- Shows only frontend logs

---

### `npm run dev:backend`
Starts only the Django backend development server.

```bash
npm run dev:backend
```

- Runs on `http://localhost:8000`
- Runs database migrations automatically
- Shows only backend logs
- Requires virtual environment to be set up (use `npm run setup:backend` first)

---

### `npm run setup:backend`
Sets up the Python backend environment.

```bash
npm run setup:backend
```

**What it does:**
1. Checks if Python is installed
2. Creates virtual environment in `backend/venv/` (if not exists)
3. Installs all Python dependencies from `backend/requirements.txt`
4. Shows progress with colored output

**When to use:**
- First time setup
- After pulling changes that update Python dependencies
- If backend dependencies are missing

---

### `npm run kill:ports`
Kills any processes running on ports 3000 and 8000.

```bash
npm run kill:ports
```

**What it does:**
1. Finds processes using port 8000 (Django backend)
2. Finds processes using port 3000 (Next.js frontend)
3. Forcefully terminates those processes
4. Works cross-platform (Windows, Linux, Mac)

**When to use:**
- Automatically runs when you use `npm run dev`
- Manually if you have orphaned server processes
- When you get "port already in use" errors

**Example output:**
```
🧹 Cleaning up previous server instances...
🔍 Checking port 8000 on Windows...
   🔪 Killing process 1234 on port 8000...
   ✅ Port 8000 cleared
🔍 Checking port 3000 on Windows...
   ✅ Port 3000 is free
✅ Port cleanup complete!
```

---

## 🏗️ Build & Production Scripts

### `npm run build`
Builds the Next.js frontend for production.

```bash
npm run build
```

Creates an optimized production build in `.next/` directory.

---

### `npm run start`
Starts the Next.js production server.

```bash
npm run build    # Build first
npm run start    # Then start production server
```

Runs the production build (requires `npm run build` first).

---

### `npm run lint`
Runs ESLint to check code quality.

```bash
npm run lint
```

Checks frontend code for errors and style issues.

---

## 🎯 Usage Examples

### Standard Development Workflow

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Start development (first time)
npm run dev
# This will automatically:
# - Set up Python virtual environment
# - Install Python dependencies
# - Run migrations
# - Start both servers
```

### After Pulling Updates

```bash
# Update Node.js dependencies
npm install

# Update Python dependencies (optional, auto-runs with npm run dev)
npm run setup:backend

# Start servers
npm run dev
```

### Working on Frontend Only

```bash
npm run dev:frontend
```

The frontend can make API calls to the backend if it's running separately.

### Working on Backend Only

```bash
npm run dev:backend
```

You can test API endpoints directly without the frontend.

### Debugging Individual Services

Run in separate terminals for better log visibility:

**Terminal 1:**
```bash
npm run dev:backend
```

**Terminal 2:**
```bash
npm run dev:frontend
```

---

## 🔍 Troubleshooting

### "Python not found"

**Problem:** `npm run setup:backend` can't find Python.

**Solution:**
1. Install Python 3.9+ from [python.org](https://python.org)
2. Ensure Python is in your PATH
3. Try: `python --version` or `python3 --version`

---

### "Failed to install dependencies"

**Problem:** Python dependencies installation fails.

**Solution:**
1. Check internet connection
2. Manually create venv: `python -m venv backend/venv`
3. Activate it:
   - Windows: `backend\venv\Scripts\activate`
   - Mac/Linux: `source backend/venv/bin/activate`
4. Install manually: `pip install -r backend/requirements.txt`

---

### "Port 3000 already in use"

**Problem:** Another process is using port 3000.

**Solution:**
1. Find and stop the process using port 3000
2. Or change the port:
   ```bash
   PORT=3001 npm run dev:frontend
   ```

---

### "Port 8000 already in use"

**Problem:** Another process is using port 8000.

**Solution:**
1. Find and stop the Django process
2. Or manually specify port:
   ```bash
   cd backend
   python manage.py runserver 8001
   ```

---

### Database connection errors

**Problem:** Backend can't connect to PostgreSQL.

**Solution:**
1. Ensure PostgreSQL is running
2. Check database credentials in `backend/.env`
3. Verify database exists:
   ```sql
   CREATE DATABASE chatportal_db;
   ```
4. Run migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```

---

### "Couldn't import Django"

**Problem:** Django is not installed or virtual environment is not activated.

**Solution:**
```bash
npm run setup:backend
```

This will recreate the virtual environment and reinstall dependencies.

---

## 🎨 Customization

### Changing Server Ports

**Frontend (Next.js):**
```bash
PORT=3001 npm run dev:frontend
```

**Backend (Django):**
Edit `backend/run_server.py` and change the runserver command:
```python
execute_from_command_line(['manage.py', 'runserver', '8001'])
```

---

### Custom Script Names/Colors

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" --names \"API,WEB\" --prefix-colors \"magenta,cyan\""
  }
}
```

---

## 📚 Additional Resources

- [README.md](README.md) - Main project documentation
- [RUN_SCRIPTS.md](RUN_SCRIPTS.md) - Shell scripts documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
