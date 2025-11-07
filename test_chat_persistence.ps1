#!/usr/bin/env pwsh
# Test Chat Persistence Script
# This script tests that all chat messages are being saved to the database

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHAT PERSISTENCE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "Step 1: Checking backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/conversations/" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running and accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "  Please start the backend first:" -ForegroundColor Yellow
    Write-Host "    cd backend" -ForegroundColor Gray
    Write-Host "    venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "    python manage.py runserver" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""

# Create a test conversation
Write-Host "Step 2: Creating test conversation..." -ForegroundColor Yellow
try {
    $createBody = @{ 
        title = "Persistence Test $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 
    } | ConvertTo-Json
    
    $conv = Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/" `
        -Method POST `
        -Body $createBody `
        -ContentType "application/json"
    
    Write-Host "✓ Created conversation ID: $($conv.id)" -ForegroundColor Green
    $conversationId = $conv.id
} catch {
    Write-Host "✗ Failed to create conversation" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Send multiple test messages
Write-Host "Step 3: Sending test messages..." -ForegroundColor Yellow

$testMessages = @(
    "Hello, this is test message 1",
    "Testing persistence with message 2",
    "Final test message 3"
)

$sentMessages = @()

foreach ($msgContent in $testMessages) {
    try {
        $msgBody = @{
            conversation_id = $conversationId
            content = $msgContent
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:8000/api/messages/send/" `
            -Method POST `
            -Body $msgBody `
            -ContentType "application/json"
        
        $userMsgId = $response.user_message.id
        $aiMsgId = $response.ai_message.id
        
        if ($userMsgId -and $aiMsgId) {
            Write-Host "✓ Sent: '$msgContent'" -ForegroundColor Green
            Write-Host "  User message ID: $userMsgId, AI message ID: $aiMsgId" -ForegroundColor Gray
            $sentMessages += @($userMsgId, $aiMsgId)
        } else {
            Write-Host "✗ Message sent but no IDs returned!" -ForegroundColor Red
            throw "Messages not saved properly"
        }
        
        Start-Sleep -Milliseconds 500
    } catch {
        Write-Host "✗ Failed to send message: $msgContent" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Verify messages were saved
Write-Host "Step 4: Verifying messages in database..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

try {
    $verification = Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/$conversationId/" -Method GET
    
    $expectedCount = $sentMessages.Count
    $actualCount = $verification.messages.Count
    
    Write-Host "  Expected messages: $expectedCount" -ForegroundColor Gray
    Write-Host "  Actual messages in DB: $actualCount" -ForegroundColor Gray
    
    if ($actualCount -eq $expectedCount) {
        Write-Host "✓ All messages verified in database!" -ForegroundColor Green
    } else {
        Write-Host "✗ Message count mismatch!" -ForegroundColor Red
        Write-Host "  Expected: $expectedCount, Found: $actualCount" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to verify messages" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verify message content
Write-Host "Step 5: Verifying message content..." -ForegroundColor Yellow

$allContentPresent = $true
foreach ($msg in $verification.messages) {
    if ($msg.sender -eq "user") {
        $found = $false
        foreach ($testMsg in $testMessages) {
            if ($msg.content -eq $testMsg) {
                $found = $true
                break
            }
        }
        
        if ($found) {
            Write-Host "✓ Found: '$($msg.content)'" -ForegroundColor Green
        } else {
            Write-Host "✗ Unexpected message: '$($msg.content)'" -ForegroundColor Red
            $allContentPresent = $false
        }
    }
}

Write-Host ""

# Final summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($actualCount -eq $expectedCount -and $allContentPresent) {
    Write-Host "✅ SUCCESS: All messages are being saved to database!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Conversation ID: $conversationId" -ForegroundColor Gray
    Write-Host "   Total Messages: $actualCount" -ForegroundColor Gray
    Write-Host "   Database: backend/db.sqlite3" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can view this conversation in the application" -ForegroundColor Cyan
    Write-Host "or verify with: python manage.py verify_database" -ForegroundColor Cyan
} else {
    Write-Host "❌ FAILURE: Messages not being saved correctly!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Backend logs for errors" -ForegroundColor Gray
    Write-Host "  2. Database file exists: backend/db.sqlite3" -ForegroundColor Gray
    Write-Host "  3. Run migrations: python manage.py migrate" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
