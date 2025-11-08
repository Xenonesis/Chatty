"""
API endpoint for managing AI provider settings from the frontend.
"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import os
import requests
from pathlib import Path


@api_view(['GET'])
def get_configured_providers(request):
    """
    GET: Get list of AI providers that have been configured (have API keys)
    
    Returns:
    {
        "providers": [
            {"id": "openai", "name": "OpenAI (GPT-4, GPT-3.5)", "model": "gpt-4"},
            {"id": "anthropic", "name": "Anthropic (Claude)", "model": "claude-3-opus"},
            ...
        ],
        "current_provider": "openai"
    }
    """
    configured_providers = []
    
    # Check which providers have API keys configured
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
        configured_providers.append({
            "id": "openai",
            "name": "OpenAI (GPT-4, GPT-3.5)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "openai" else None
        })
    
    if settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY.strip():
        configured_providers.append({
            "id": "anthropic",
            "name": "Anthropic (Claude)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "anthropic" else None
        })
    
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY.strip():
        configured_providers.append({
            "id": "google",
            "name": "Google (Gemini)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "google" else None
        })
    
    if hasattr(settings, 'OPENROUTER_API_KEY') and settings.OPENROUTER_API_KEY and settings.OPENROUTER_API_KEY.strip():
        configured_providers.append({
            "id": "openrouter",
            "name": "OpenRouter",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "openrouter" else None
        })
    
    # LM Studio is always available if base URL is configured
    if settings.LM_STUDIO_BASE_URL and settings.LM_STUDIO_BASE_URL.strip():
        configured_providers.append({
            "id": "lmstudio",
            "name": "LM Studio (Local)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "lmstudio" else None
        })
    
    # Ollama is available if base URL is configured
    if hasattr(settings, 'OLLAMA_BASE_URL') and settings.OLLAMA_BASE_URL and settings.OLLAMA_BASE_URL.strip():
        configured_providers.append({
            "id": "ollama",
            "name": "Ollama (Local)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "ollama" else None
        })
    
    return Response({
        "providers": configured_providers,
        "current_provider": settings.AI_PROVIDER if configured_providers else None
    }, status=status.HTTP_200_OK)


def update_env_file(key, value):
    """
    Update or add a key-value pair in the .env file
    """
    # Find the .env file (should be in the project root, one level up from backend)
    env_path = Path(__file__).resolve().parent.parent.parent / '.env'
    
    # If .env doesn't exist, create it
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
    
    # If key wasn't found, add it
    if not key_found:
        new_lines.append(f'{key}={value}\n')
    
    # Write back to file
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)


@api_view(['GET', 'POST'])
def manage_ai_settings(request):
    """
    GET: Get current AI provider settings
    POST: Update AI provider settings
    
    Note: This is a basic implementation. In production, you should:
    1. Add authentication and authorization
    2. Store settings in database per user
    3. Encrypt sensitive data like API keys
    4. Validate settings before applying
    """
    
    if request.method == 'GET':
        # Return current settings (without exposing full API keys)
        current_settings = {
            'provider': settings.AI_PROVIDER,
            'model': settings.AI_MODEL,
            'has_openai_key': bool(settings.OPENAI_API_KEY),
            'has_anthropic_key': bool(settings.ANTHROPIC_API_KEY),
            'has_google_key': bool(settings.GOOGLE_API_KEY),
            'lm_studio_url': settings.LM_STUDIO_BASE_URL,
        }
        return Response(current_settings, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Update settings
        provider = request.data.get('provider')
        api_settings = request.data.get('settings', {})
        
        if not provider:
            return Response(
                {"error": "provider is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate provider
        valid_providers = ['openai', 'anthropic', 'google', 'openrouter', 'lmstudio', 'ollama']
        if provider not in valid_providers:
            return Response(
                {"error": f"Invalid provider. Must be one of: {', '.join(valid_providers)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update environment variables and persist to .env file
        os.environ['AI_PROVIDER'] = provider
        settings.AI_PROVIDER = provider
        update_env_file('AI_PROVIDER', provider)
        
        if 'model' in api_settings:
            model = api_settings['model']
            os.environ['AI_MODEL'] = model
            settings.AI_MODEL = model
            update_env_file('AI_MODEL', model)
        
        if 'apiKey' in api_settings:
            api_key = api_settings['apiKey']
            if provider == 'openai':
                os.environ['OPENAI_API_KEY'] = api_key
                settings.OPENAI_API_KEY = api_key
                update_env_file('OPENAI_API_KEY', api_key)
                print(f"Set OPENAI_API_KEY: {api_key[:10]}...")
            elif provider == 'anthropic':
                os.environ['ANTHROPIC_API_KEY'] = api_key
                settings.ANTHROPIC_API_KEY = api_key
                update_env_file('ANTHROPIC_API_KEY', api_key)
                print(f"Set ANTHROPIC_API_KEY: {api_key[:10]}...")
            elif provider == 'google':
                os.environ['GOOGLE_API_KEY'] = api_key
                settings.GOOGLE_API_KEY = api_key
                update_env_file('GOOGLE_API_KEY', api_key)
                print(f"Set GOOGLE_API_KEY: {api_key[:10]}...")
            elif provider == 'openrouter':
                os.environ['OPENROUTER_API_KEY'] = api_key
                settings.OPENROUTER_API_KEY = api_key
                update_env_file('OPENROUTER_API_KEY', api_key)
                print(f"Set OPENROUTER_API_KEY: {api_key[:10]}...")
            elif provider == 'lmstudio':
                os.environ['LM_STUDIO_API_KEY'] = api_key
                settings.LM_STUDIO_API_KEY = api_key
                update_env_file('LM_STUDIO_API_KEY', api_key)
                print(f"Set LM_STUDIO_API_KEY: {api_key[:10]}...")
        
        if 'baseUrl' in api_settings:
            if provider == 'lmstudio':
                base_url = api_settings['baseUrl']
                os.environ['LM_STUDIO_BASE_URL'] = base_url
                settings.LM_STUDIO_BASE_URL = base_url
                update_env_file('LM_STUDIO_BASE_URL', base_url)
            elif provider == 'ollama':
                base_url = api_settings['baseUrl']
                os.environ['OLLAMA_BASE_URL'] = base_url
                settings.OLLAMA_BASE_URL = base_url
                update_env_file('OLLAMA_BASE_URL', base_url)
        
        return Response(
            {
                "message": "Settings updated successfully and saved to .env file",
                "provider": provider
            },
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
def fetch_models(request):
    """
    POST: Fetch available models from AI provider
    
    Request body:
    {
        "provider": "openai|anthropic|google|openrouter|lmstudio|ollama",
        "apiKey": "...",  # Required for cloud providers
        "baseUrl": "..."  # Required for local providers (lmstudio, ollama)
    }
    
    Returns:
    {
        "success": true,
        "models": [
            {"id": "model-id", "name": "Model Name"},
            ...
        ],
        "message": "Found X models"
    }
    """
    provider = request.data.get('provider')
    api_key = request.data.get('apiKey')
    base_url = request.data.get('baseUrl')
    
    if not provider:
        return Response(
            {"success": False, "error": "provider is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        models = []
        
        if provider == 'openai':
            if not api_key:
                return Response(
                    {"success": False, "error": "API key is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            response = requests.get(
                'https://api.openai.com/v1/models',
                headers={'Authorization': f'Bearer {api_key}'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [
                    {"id": m["id"], "name": m["id"]}
                    for m in data["data"]
                    if "gpt" in m["id"]
                ]
                models.sort(key=lambda x: x["id"], reverse=True)
            else:
                return Response(
                    {"success": False, "error": "Invalid API key"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        elif provider == 'anthropic':
            # Anthropic doesn't have a models endpoint, return predefined list
            models = [
                {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet"},
                {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"},
                {"id": "claude-3-sonnet-20240229", "name": "Claude 3 Sonnet"},
                {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku"},
            ]
        
        elif provider == 'google':
            if not api_key:
                return Response(
                    {"success": False, "error": "API key is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            response = requests.get(
                f'https://generativelanguage.googleapis.com/v1/models?key={api_key}',
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [
                    {
                        "id": m["name"].replace("models/", ""),
                        "name": m.get("displayName", m["name"])
                    }
                    for m in data.get("models", [])
                    if "gemini" in m["name"]
                ]
            else:
                return Response(
                    {"success": False, "error": "Invalid API key"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        elif provider == 'openrouter':
            if not api_key:
                return Response(
                    {"success": False, "error": "API key is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            response = requests.get(
                'https://openrouter.ai/api/v1/models',
                headers={'Authorization': f'Bearer {api_key}'},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [
                    {"id": m["id"], "name": m.get("name", m["id"])}
                    for m in data.get("data", [])
                ]
            else:
                return Response(
                    {"success": False, "error": "Invalid API key or unable to fetch models"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        elif provider == 'lmstudio':
            url = base_url or 'http://localhost:1234/v1'
            
            response = requests.get(
                f'{url}/models',
                headers={'Authorization': f'Bearer {api_key}'} if api_key else {},
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [
                    {"id": m["id"], "name": m["id"]}
                    for m in data.get("data", [])
                ]
            else:
                return Response(
                    {"success": False, "error": "Cannot connect to LM Studio"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
        elif provider == 'ollama':
            url = base_url or 'http://localhost:11434'
            
            response = requests.get(
                f'{url}/api/tags',
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                models = [
                    {"id": m["name"], "name": m["name"]}
                    for m in data.get("models", [])
                ]
            else:
                return Response(
                    {"success": False, "error": "Cannot connect to Ollama"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        
        else:
            return Response(
                {"success": False, "error": f"Unsupported provider: {provider}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                "success": True,
                "models": models,
                "message": f"Found {len(models)} models"
            },
            status=status.HTTP_200_OK
        )
    
    except requests.exceptions.Timeout:
        return Response(
            {"success": False, "error": "Request timeout - service may be unavailable"},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.ConnectionError:
        return Response(
            {"success": False, "error": "Cannot connect to service"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response(
            {"success": False, "error": f"Error fetching models: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
