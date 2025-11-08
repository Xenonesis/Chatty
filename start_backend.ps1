# Start Backend Server

Write-Host "Starting ChattyAI Backend Server..." -ForegroundColor Cyan

# Kill any existing processes
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

# Change to backend directory and start server
Set-Location backend

# Activate virtual environment and start server
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & .venv\Scripts\Activate.ps1
} elseif (Test-Path "venv\Scripts\Activate.ps1") {
    & venv\Scripts\Activate.ps1
}

Write-Host "Backend server starting on http://localhost:8000" -ForegroundColor Green
python manage.py runserver 0.0.0.0:8000
