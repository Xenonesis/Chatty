#!/usr/bin/env pwsh
# Backend Runner Script for AI Chat Portal
# This script starts the Django development server

Write-Host "🚀 Starting Backend Development Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Push-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Check if requirements are installed
Write-Host "📦 Installing/Updating dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Migrations failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Starting Django on http://localhost:8000" -ForegroundColor Green
Write-Host ""

# Start the Django development server
python manage.py runserver

Pop-Location
