# 🚀 Run Scripts Documentation

This project includes convenient run scripts to start the backend and frontend development servers quickly and easily.

## ⚡ Quick Start (Recommended)

The easiest way to run both servers is using npm:

```bash
npm run dev
```

This will start both the backend (Django) and frontend (Next.js) servers concurrently.

### Available npm Scripts:
- `npm run dev` - Start both backend and frontend servers
- `npm run dev:frontend` - Start only the frontend server
- `npm run dev:backend` - Start only the backend server

## Available Shell Scripts

### 1. `run.ps1` / `run.sh` - Start Everything
Starts both backend and frontend servers simultaneously.

**Windows:**
```powershell
.\run.ps1
```

**Linux/Mac:**
```bash
./run.sh
```

**What it does:**
- Launches backend server on `http://localhost:8000`
- Launches frontend server on `http://localhost:3000`
- Runs both servers in parallel
- Press `Ctrl+C` to stop both servers

---

### 2. `run_backend.ps1` / `run_backend.sh` - Backend Only
Starts only the Django backend server.

**Windows:**
```powershell
.\run_backend.ps1
```

**Linux/Mac:**
```bash
./run_backend.sh
```

**What it does:**
- Creates Python virtual environment (if not exists)
- Activates the virtual environment
- Installs/updates Python dependencies from `requirements.txt`
- Runs database migrations
- Starts Django development server on `http://localhost:8000`

**Requirements:**
- Python 3.9+
- PostgreSQL 12+ (running and configured)

---

### 3. `run_frontend.ps1` / `run_frontend.sh` - Frontend Only
Starts only the Next.js frontend server.

**Windows:**
```powershell
.\run_frontend.ps1
```

**Linux/Mac:**
```bash
./run_frontend.sh
```

**What it does:**
- Installs Node.js dependencies (if not exists)
- Starts Next.js development server on `http://localhost:3000`

**Requirements:**
- Node.js 18+
- npm or yarn

---

## First Time Setup

### Prerequisites
1. **Python 3.9+** - [Download](https://www.python.org/downloads/)
2. **Node.js 18+** - [Download](https://nodejs.org/)
3. **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)

### Database Configuration
Before running the backend, ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE chatportal_db;
CREATE USER chatportal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chatportal_db TO chatportal_user;
```

Then create a `.env` file in the `backend/` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_NAME=chatportal_db
DATABASE_USER=chatportal_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# AI API Keys (optional, configure as needed)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
```

---

## Troubleshooting

### Backend Issues

**"Failed to create virtual environment"**
- Ensure Python is installed and in PATH
- Try: `python --version` or `python3 --version`

**"Failed to install dependencies"**
- Check internet connection
- Try manually: `cd backend && pip install -r requirements.txt`

**"Database connection failed"**
- Ensure PostgreSQL is running
- Verify database credentials in `.env` file
- Check if database exists: `psql -l`

### Frontend Issues

**"Failed to install dependencies"**
- Check internet connection
- Try manually: `npm install`
- Clear cache: `npm cache clean --force`

**"Port 3000 already in use"**
- Stop other processes using port 3000
- Or change port: `PORT=3001 npm run dev`

### Permission Issues (Linux/Mac)

If you get permission errors, make scripts executable:

```bash
chmod +x run.sh run_backend.sh run_frontend.sh
```

---

## Development Tips

### Running in Separate Terminals
For better log visibility, run backend and frontend in separate terminal windows:

**Terminal 1:**
```bash
./run_backend.sh
```

**Terminal 2:**
```bash
./run_frontend.sh
```

### Stopping Servers
- **Single script**: Press `Ctrl+C`
- **Master script** (`run.ps1`/`run.sh`): Press `Ctrl+C` to stop both servers

### Viewing Logs
- Backend logs appear in the terminal running the backend server
- Frontend logs appear in the terminal running the frontend server
- Browser console shows client-side errors

---

## Production Deployment

These run scripts are for **development only**. For production:

- **Backend**: Use gunicorn or uWSGI with nginx
- **Frontend**: Build with `npm run build` and deploy to Vercel/Netlify
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

---

## Additional Resources

- [README.md](README.md) - Main project documentation
- [QUICK_START.md](QUICK_START.md) - Detailed setup guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete installation instructions
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API reference
