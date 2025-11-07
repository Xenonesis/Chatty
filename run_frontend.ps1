#!/usr/bin/env pwsh
# Frontend Runner Script for AI Chat Portal
# This script starts the Next.js development server

Write-Host "🚀 Starting Frontend Development Server..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Starting Next.js on http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Start the Next.js development server
npm run dev
