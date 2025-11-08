# API Key Persistence Fix

## Problem

Users were experiencing an issue where API keys saved through the AI Settings UI would sometimes disappear, resulting in errors like:

> "I apologize, but I encountered an error generating a response: Google API key not configured. Please set it in AI Settings."

This would happen even after the user had already saved their API key.

## Root Cause

The original implementation in `backend/chat/views_api_settings.py` only updated the API keys in memory:

```python
# Old code - only updates in-memory settings
os.environ['GOOGLE_API_KEY'] = api_key
settings.GOOGLE_API_KEY = api_key
```

This meant that:
1. API keys were lost when the Django server restarted
2. In multi-worker deployments, different workers might have different settings
3. Keys weren't persisted across development sessions

## Solution

The fix adds a new `update_env_file()` function that persists settings to the `.env` file:

```python
def update_env_file(key, value):
    """
    Update or add a key-value pair in the .env file
    """
    env_path = Path(__file__).resolve().parent.parent.parent / '.env'
    
    # Create .env if it doesn't exist
    if not env_path.exists():
        env_path.touch()
    
    # Read existing content
    lines = []
    key_found = False
    
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    
    # Update or add the key
    new_lines = []
    for line in lines:
        if line.strip().startswith(f'{key}='):
            new_lines.append(f'{key}={value}\n')
            key_found = True
        else:
            new_lines.append(line)
    
    if not key_found:
        new_lines.append(f'{key}={value}\n')
    
    # Write back to file
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
```

Now when users save settings through the UI, the code:
1. Updates in-memory settings (for immediate use)
2. Updates environment variables (for current process)
3. **Persists to `.env` file** (for future restarts)

## Changes Made

### 1. Updated `backend/chat/views_api_settings.py`

- Added `update_env_file()` helper function
- Modified `manage_ai_settings()` to call `update_env_file()` for all settings
- Updated success message to indicate persistence

### 2. Created `.env.example`

A comprehensive example file showing all available configuration options:
- Django settings
- Database configuration
- AI provider settings
- API keys for all supported providers
- Local AI configuration

### 3. Created `TROUBLESHOOTING.md`

A comprehensive troubleshooting guide covering:
- API key configuration issues
- Database problems
- Port conflicts
- CORS errors
- Module installation issues
- AI provider connection problems

## How It Works Now

1. **User saves API key through UI** → 
2. **Backend receives the request** →
3. **Updates in-memory settings** (immediate effect) →
4. **Writes to `.env` file** (persistent storage) →
5. **Returns success response** →
6. **Settings survive server restarts** ✅

## Testing the Fix

1. Save an API key through the AI Settings UI
2. Check that `.env` file is created/updated in the project root
3. Restart the backend server
4. Verify the API key is still configured
5. Send a chat message to confirm it works

## Migration for Existing Users

If you previously saved API keys that were lost:

1. **Option A: Use the UI** (Recommended)
   - Go to AI Settings
   - Re-enter your API key
   - Save settings
   - The key will now be persisted to `.env`

2. **Option B: Manual Configuration**
   - Copy `.env.example` to `.env`
   - Add your API keys directly to `.env`
   - Restart the backend server

## Security Considerations

- The `.env` file is already in `.gitignore` (pattern: `.env*`)
- API keys are never exposed in API responses
- The `.env` file should have restricted permissions in production
- Consider using a secrets management service for production deployments

## Future Improvements

For production deployments, consider:
1. Storing settings in a database with per-user encryption
2. Using a secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.)
3. Implementing proper authentication and authorization
4. Adding audit logging for settings changes
5. Supporting environment-specific configuration files

## Files Modified

- `backend/chat/views_api_settings.py` - Added persistence logic
- `.env.example` - Created comprehensive example
- `TROUBLESHOOTING.md` - Created troubleshooting guide
- `API_KEY_PERSISTENCE_FIX.md` - This document

## Related Issues

This fix resolves the intermittent "API key not configured" errors that users experienced after saving their keys through the UI.
