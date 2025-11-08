# Verification Script for Complete Workflow Implementation

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  ChattyAI - Workflow Implementation Verification" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Frontend Files
Write-Host "Checking Frontend Files..." -ForegroundColor Yellow
$frontendFiles = @(
    "components/IntelligenceQuery.tsx",
    "app/page.tsx",
    "lib/api.ts"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Backend Files
Write-Host "`nChecking Backend Files..." -ForegroundColor Yellow
$backendFiles = @(
    "backend/chat/vector_search_service.py",
    "backend/chat/background_tasks.py",
    "backend/chat/management/commands/run_background_tasks.py",
    "backend/run_scheduler.py",
    "run_scheduler.ps1"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Migration Files
Write-Host "`nChecking Migration Files..." -ForegroundColor Yellow
$migrationFiles = @(
    "backend/chat/migrations/0002_add_user_tracking.py"
)

foreach ($file in $migrationFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Documentation
Write-Host "`nChecking Documentation..." -ForegroundColor Yellow
$docFiles = @(
    "WORKFLOW_IMPLEMENTATION.md",
    "SETUP_NEW_FEATURES.md",
    "MIGRATION_GUIDE.md",
    "QUICK_REFERENCE.md",
    "VERIFICATION_CHECKLIST.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Dependencies
Write-Host "`nChecking Dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    $requirements = Get-Content "backend/requirements.txt"
    if ($requirements -match "schedule") {
        Write-Host "  [OK] schedule package in requirements.txt" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] schedule package not in requirements.txt" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  [MISSING] backend/requirements.txt" -ForegroundColor Red
    $allGood = $false
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  Status: " -NoNewline
    Write-Host "ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run migrations: cd backend && python manage.py migrate" -ForegroundColor White
    Write-Host "  2. Install dependencies: pip install -r requirements.txt" -ForegroundColor White
    Write-Host "  3. Start the app: .\run.ps1" -ForegroundColor White
    Write-Host "  4. Start scheduler (optional): .\run_scheduler.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Documentation: See SETUP_NEW_FEATURES.md" -ForegroundColor Cyan
} else {
    Write-Host "  Status: " -NoNewline
    Write-Host "SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Please review the missing files above." -ForegroundColor Yellow
}

Write-Host ""
