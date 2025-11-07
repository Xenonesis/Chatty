# AI Provider Filtering Feature

## Overview
The chat interface now displays **only configured AI providers** in the dropdown menu. This ensures users only see providers they can actually use based on their API key configuration.

## How It Works

### Backend (Django)
The endpoint `/api/settings/ai/providers/` checks which providers have API keys configured and returns only those:

```python
# backend/chat/views_api_settings.py
@api_view(['GET'])
def get_configured_providers(request):
    """
    Returns list of AI providers that have been configured (have API keys)
    """
    configured_providers = []
    
    # Only includes providers with valid API keys or base URLs
    if settings.OPENAI_API_KEY:
        configured_providers.append({...})
    
    if settings.ANTHROPIC_API_KEY:
        configured_providers.append({...})
    
    # ... and so on
```

### Frontend (Next.js/React)
The `ChatInterface` component calls this endpoint and dynamically populates the dropdown:

```typescript
// components/ChatInterface.tsx
const loadConfiguredProviders = async () => {
  const response = await api.getConfiguredProviders();
  setAvailableProviders(response.providers);
  setSelectedProvider(response.current_provider || response.providers[0]?.id);
};
```

## Configuration

### Environment Variables
To configure AI providers, set the following in your `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...
AI_PROVIDER=openai
AI_MODEL=gpt-4

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=anthropic
AI_MODEL=claude-3-opus-20240229

# Google
GOOGLE_API_KEY=AIza...
AI_PROVIDER=google
AI_MODEL=gemini-pro

# LM Studio (Local)
LM_STUDIO_BASE_URL=http://localhost:1234/v1
AI_PROVIDER=lmstudio
AI_MODEL=local-model
```

## Features

### 1. **Dynamic Provider List**
- Only shows providers with valid API keys configured
- Automatically updates when settings change
- Shows current model for each provider

### 2. **User-Friendly UI**
- Clear warning message when no providers are configured
- Displays model information below the dropdown
- Disables chat input when no providers are available

### 3. **Provider Information**
Each provider in the dropdown shows:
- Provider name (e.g., "OpenAI (GPT-4, GPT-3.5)")
- Current model being used (displayed below dropdown)

### 4. **Validation**
- Backend validates that API keys exist before including provider
- Frontend checks for empty provider list and shows helpful message
- Input fields disabled when no providers configured

## API Response Format

```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI (GPT-4, GPT-3.5)",
      "model": "gpt-4"
    },
    {
      "id": "lmstudio",
      "name": "LM Studio (Local)",
      "model": "local-model"
    }
  ],
  "current_provider": "openai"
}
```

## Testing

### Manual Testing
Run the test script to verify the endpoint:
```bash
python tmp_rovodev_test_configured_providers.py
```

### Unit Tests
Run the automated test suite:
```bash
cd backend
python manage.py test chat.tests.AIProviderSettingsTest
```

Test coverage includes:
- ✅ All providers configured
- ✅ No providers configured
- ✅ Single provider configured (OpenAI)
- ✅ Single provider configured (LM Studio)

## User Experience

### No Providers Configured
Users see a helpful warning message:
```
⚠️ No AI providers configured
Please configure at least one AI provider (OpenAI, Anthropic, Google, or LM Studio) 
in the settings to start chatting.
```

### Providers Configured
Users see:
- Dropdown with available providers
- Current model name below dropdown
- Fully functional chat interface

## Benefits

1. **Prevents Errors**: Users can't select providers without valid credentials
2. **Clear Feedback**: Shows which providers are ready to use
3. **Better UX**: Only displays relevant options
4. **Flexible**: Automatically adapts to configuration changes
5. **Secure**: Doesn't expose API keys in the response

## Implementation Details

### Files Modified
- `backend/chat/views_api_settings.py` - Enhanced provider endpoint
- `components/ChatInterface.tsx` - Dynamic dropdown rendering
- `backend/chat/tests.py` - Comprehensive test coverage

### Key Functions
- `get_configured_providers()` - Backend endpoint
- `loadConfiguredProviders()` - Frontend API call
- `AIProviderSettingsTest` - Test suite

## Future Enhancements

Potential improvements:
1. Show provider status indicators (online/offline)
2. Display rate limits or usage statistics
3. Allow per-conversation provider switching
4. Add provider health checks
5. Support custom provider endpoints
