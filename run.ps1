#!/usr/bin/env pwsh
# Master Runner Script for AI Chat Portal
# This script starts both frontend and backend servers

Write-Host "🚀 Starting AI Chat Portal..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backend = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & ".\run_backend.ps1"
}

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontend = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & ".\run_frontend.ps1"
}

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and show output
try {
    while ($true) {
        Receive-Job $backend -ErrorAction SilentlyContinue
        Receive-Job $frontend -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 100
        
        if (($backend.State -eq "Failed" -or $backend.State -eq "Stopped") -and 
            ($frontend.State -eq "Failed" -or $frontend.State -eq "Stopped")) {
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Red
    Stop-Job $backend -ErrorAction SilentlyContinue
    Stop-Job $frontend -ErrorAction SilentlyContinue
    Remove-Job $backend -ErrorAction SilentlyContinue
    Remove-Job $frontend -ErrorAction SilentlyContinue
}
