# 🚀 Quick Database Commands Reference

Quick reference for common database operations and checks.

---

## Quick Status Check

### Check Everything at Once
```powershell
.\check_and_migrate_database.ps1
```
✅ Checks backend status  
✅ Verifies migrations  
✅ Tests persistence  
✅ Provides summary  

---

## Testing Commands

### Test Message Persistence
```powershell
.\test_chat_persistence.ps1
```
Sends test messages and verifies they're saved to database.

### Verify Database Integrity
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py verify_database
```
Shows database statistics and checks for issues.

---

## Migration Commands

### Check Migration Status
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py showmigrations
```

### Create New Migrations (after model changes)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py makemigrations
```

### Apply Migrations
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

---

## Database Information

### Database Location
```
backend/db.sqlite3
```

### View Database Size
```powershell
Get-Item backend/db.sqlite3 | Select-Object Name, @{Name="Size (KB)";Expression={[math]::Round($_.Length/1KB, 2)}}
```

### Check if Database Exists
```powershell
Test-Path backend/db.sqlite3
```

---

## API Testing

### Get All Conversations
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/" -Method GET
```

### Get Specific Conversation
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/1/" -Method GET
```

### Create New Conversation
```powershell
$body = @{ title = "Test Conversation" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/conversations/" -Method POST -Body $body -ContentType "application/json"
```

### Send Message
```powershell
$body = @{
    conversation_id = 1
    content = "Test message"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/messages/send/" -Method POST -Body $body -ContentType "application/json"
```

---

## Troubleshooting

### Backend Not Running
```powershell
.\run_backend.ps1
```
or
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Database Issues
1. Check if database file exists: `Test-Path backend/db.sqlite3`
2. Verify migrations: `python manage.py showmigrations`
3. Run integrity check: `python manage.py verify_database`
4. Check backend logs for errors

### Migration Issues
```powershell
cd backend
.\venv\Scripts\Activate.ps1
# Reset chat app migrations (WARNING: deletes data)
python manage.py migrate chat zero
# Re-run migrations
python manage.py migrate
```

---

## Backup & Restore

### Backup Database
```powershell
Copy-Item backend/db.sqlite3 backend/db.sqlite3.backup
```

### Restore from Backup
```powershell
Copy-Item backend/db.sqlite3.backup backend/db.sqlite3
```

### Backup with Timestamp
```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item backend/db.sqlite3 "backend/db_backup_$timestamp.sqlite3"
```

---

## Development Commands

### Create Sample Data
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py create_sample_data
```

### Django Shell (for manual queries)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py shell
```

```python
# Inside shell:
from chat.models import Conversation, Message

# Count conversations
Conversation.objects.count()

# Count messages
Message.objects.count()

# Get latest conversation
Conversation.objects.last()

# Get messages in conversation
Message.objects.filter(conversation_id=1)
```

---

## Status Indicators

### ✅ Everything Working
- Backend accessible at http://localhost:8000
- `check_and_migrate_database.ps1` shows all green
- Database file exists and has content
- Messages have IDs when saved

### ⚠️ Needs Attention
- Backend not running
- Pending migrations detected
- Empty conversations (harmless but can clean up)

### ❌ Issues
- Database file missing
- Migration errors
- Messages not getting IDs
- API errors

---

## Quick Verification Checklist

- [ ] Backend is running (`http://localhost:8000/api/conversations/`)
- [ ] Database file exists (`backend/db.sqlite3`)
- [ ] No pending migrations (`python manage.py showmigrations`)
- [ ] Test message saves successfully (`.\test_chat_persistence.ps1`)
- [ ] Messages have IDs when retrieved

---

## File Locations

| File | Purpose |
|------|---------|
| `backend/db.sqlite3` | Main database file |
| `backend/chat/models.py` | Database schema definitions |
| `backend/chat/views.py` | API endpoints that save data |
| `backend/chat/migrations/` | Database migration files |
| `check_and_migrate_database.ps1` | Comprehensive check script |
| `test_chat_persistence.ps1` | Persistence test script |

---

## Daily Use

### Before Starting Work
```powershell
# Quick check that everything is working
.\check_and_migrate_database.ps1
```

### After Model Changes
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py makemigrations
python manage.py migrate
```

### Weekly Backup
```powershell
$timestamp = Get-Date -Format "yyyyMMdd"
Copy-Item backend/db.sqlite3 "backups/db_$timestamp.sqlite3"
```

---

## Help & Documentation

- Full documentation: `README_DATABASE.md`
- Migration guide: `DATABASE_MIGRATION_COMPLETE.md`
- Test report: `DATABASE_PERSISTENCE_TEST_REPORT.md`
- Verification results: `VERIFICATION_COMPLETE.md`

---

**Last Updated:** 2025-11-08  
**Status:** All systems operational ✅
