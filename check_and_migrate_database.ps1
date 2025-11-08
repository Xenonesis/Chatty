#!/usr/bin/env pwsh
# Complete Database Migration and Persistence Check Script
# This script ensures database is migrated and all chats are being saved

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  DATABASE MIGRATION & CHAT PERSISTENCE VERIFICATION" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/conversations/" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running and accessible" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "✗ Backend is not running" -ForegroundColor Red
    Write-Host "  Please start the backend first:" -ForegroundColor Yellow
    Write-Host "    .\run_backend.ps1" -ForegroundColor Gray
    $backendRunning = $false
}

Write-Host ""

# Activate virtual environment and check migrations
Write-Host "🔍 Checking database migrations..." -ForegroundColor Yellow
& backend/venv/Scripts/Activate.ps1

cd backend

# Show current migration status
Write-Host "`nCurrent migration status:" -ForegroundColor Cyan
python manage.py showmigrations chat

# Check for new migrations
Write-Host "`nChecking for pending migrations..." -ForegroundColor Cyan
$makeMigrationsOutput = python manage.py makemigrations --dry-run 2>&1 | Out-String

if ($makeMigrationsOutput -match "No changes detected") {
    Write-Host "✓ No new migrations needed - database schema is current" -ForegroundColor Green
    $needsMigration = $false
} else {
    Write-Host "⚠ New migrations detected!" -ForegroundColor Yellow
    Write-Host $makeMigrationsOutput -ForegroundColor Gray
    $needsMigration = $true
}

Write-Host ""

# Apply migrations if needed
if ($needsMigration) {
    Write-Host "📝 Creating new migrations..." -ForegroundColor Yellow
    python manage.py makemigrations
    
    Write-Host "`n🔄 Applying migrations to database..." -ForegroundColor Yellow
    python manage.py migrate
    
    Write-Host "✓ Migrations applied successfully" -ForegroundColor Green
} else {
    Write-Host "✓ Database schema is up to date" -ForegroundColor Green
}

Write-Host ""

# Verify database integrity
Write-Host "🔍 Verifying database integrity..." -ForegroundColor Yellow
python manage.py verify_database

Write-Host ""
cd ..

# Test persistence if backend is running
if ($backendRunning) {
    Write-Host "🧪 Testing message persistence..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Create a test conversation
        $createBody = @{ 
            title = "Migration Test $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 
        } | ConvertTo-Json
        
        $conv = Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/" `
            -Method POST `
            -Body $createBody `
            -ContentType "application/json"
        
        Write-Host "✓ Created test conversation ID: $($conv.id)" -ForegroundColor Green
        
        # Send a test message
        $msgBody = @{
            conversation_id = $conv.id
            content = "Testing persistence after migration check"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/messages/send/" `
            -Method POST `
            -Body $msgBody `
            -ContentType "application/json"
        
        if ($response.user_message.id -and $response.ai_message.id) {
            Write-Host "✓ Messages sent successfully" -ForegroundColor Green
            Write-Host "  User message ID: $($response.user_message.id)" -ForegroundColor Gray
            Write-Host "  AI message ID: $($response.ai_message.id)" -ForegroundColor Gray
            
            # Verify persistence
            Start-Sleep -Seconds 1
            $verification = Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/$($conv.id)/" -Method GET
            
            if ($verification.messages.Count -eq 2) {
                Write-Host "✓ Messages verified in database" -ForegroundColor Green
                $persistenceOK = $true
            } else {
                Write-Host "✗ Message count mismatch!" -ForegroundColor Red
                $persistenceOK = $false
            }
        } else {
            Write-Host "✗ Messages sent but no IDs returned" -ForegroundColor Red
            $persistenceOK = $false
        }
        
    } catch {
        Write-Host "✗ Persistence test failed: $($_.Exception.Message)" -ForegroundColor Red
        $persistenceOK = $false
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Summary
$allGood = $true

Write-Host "Backend Status:" -ForegroundColor White
if ($backendRunning) {
    Write-Host "  ✓ Running and accessible" -ForegroundColor Green
} else {
    Write-Host "  ✗ Not running" -ForegroundColor Red
    $allGood = $false
}

Write-Host "`nDatabase Schema:" -ForegroundColor White
if (-not $needsMigration) {
    Write-Host "  ✓ Up to date" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Migrations were needed (now applied)" -ForegroundColor Yellow
}

Write-Host "`nMessage Persistence:" -ForegroundColor White
if ($backendRunning -and $persistenceOK) {
    Write-Host "  ✓ All messages are being saved to database" -ForegroundColor Green
} elseif (-not $backendRunning) {
    Write-Host "  ⚠ Not tested (backend not running)" -ForegroundColor Yellow
} else {
    Write-Host "  ✗ Issues detected" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

if ($allGood -and $backendRunning) {
    Write-Host "✅ EXCELLENT: Database is migrated and all chats are being saved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your chat application is ready to use." -ForegroundColor Cyan
} elseif (-not $backendRunning) {
    Write-Host "⚠️  BACKEND NOT RUNNING" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Database is ready, but please start the backend to test persistence:" -ForegroundColor Cyan
    Write-Host "  .\run_backend.ps1" -ForegroundColor Gray
} else {
    Write-Host "❌ ISSUES DETECTED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please review the errors above and:" -ForegroundColor Yellow
    Write-Host "  1. Check backend logs for errors" -ForegroundColor Gray
    Write-Host "  2. Verify database file exists: backend/db.sqlite3" -ForegroundColor Gray
    Write-Host "  3. Try restarting the backend" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
