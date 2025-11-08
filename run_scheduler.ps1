# PowerShell script to run the background task scheduler

Write-Host "Starting ChattyAI Background Task Scheduler..." -ForegroundColor Cyan

# Check if virtual environment exists
if (Test-Path "backend\.venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "backend\.venv\Scripts\Activate.ps1"
} elseif (Test-Path "backend\venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "backend\venv\Scripts\Activate.ps1"
} else {
    Write-Host "Virtual environment not found. Please run setup first." -ForegroundColor Red
    exit 1
}

# Change to backend directory
Set-Location backend

# Run scheduler
Write-Host "Starting scheduler..." -ForegroundColor Green
python run_scheduler.py
