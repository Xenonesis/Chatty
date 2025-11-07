"""
API endpoint for managing AI provider settings from the frontend.
"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import os


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
    if settings.OPENAI_API_KEY:
        configured_providers.append({
            "id": "openai",
            "name": "OpenAI (GPT-4, GPT-3.5)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "openai" else None
        })
    
    if settings.ANTHROPIC_API_KEY:
        configured_providers.append({
            "id": "anthropic",
            "name": "Anthropic (Claude)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "anthropic" else None
        })
    
    if settings.GOOGLE_API_KEY:
        configured_providers.append({
            "id": "google",
            "name": "Google (Gemini)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "google" else None
        })
    
    # LM Studio is always available if base URL is configured
    if settings.LM_STUDIO_BASE_URL:
        configured_providers.append({
            "id": "lmstudio",
            "name": "LM Studio (Local)",
            "model": settings.AI_MODEL if settings.AI_PROVIDER == "lmstudio" else None
        })
    
    return Response({
        "providers": configured_providers,
        "current_provider": settings.AI_PROVIDER if configured_providers else None
    }, status=status.HTTP_200_OK)


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
        valid_providers = ['openai', 'anthropic', 'google', 'lmstudio']
        if provider not in valid_providers:
            return Response(
                {"error": f"Invalid provider. Must be one of: {', '.join(valid_providers)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update environment variables (temporary - in production, use database)
        # Note: These changes only affect the current process
        os.environ['AI_PROVIDER'] = provider
        settings.AI_PROVIDER = provider
        
        if 'model' in api_settings:
            os.environ['AI_MODEL'] = api_settings['model']
            settings.AI_MODEL = api_settings['model']
        
        if 'apiKey' in api_settings:
            if provider == 'openai':
                os.environ['OPENAI_API_KEY'] = api_settings['apiKey']
                settings.OPENAI_API_KEY = api_settings['apiKey']
            elif provider == 'anthropic':
                os.environ['ANTHROPIC_API_KEY'] = api_settings['apiKey']
                settings.ANTHROPIC_API_KEY = api_settings['apiKey']
            elif provider == 'google':
                os.environ['GOOGLE_API_KEY'] = api_settings['apiKey']
                settings.GOOGLE_API_KEY = api_settings['apiKey']
            elif provider == 'lmstudio':
                os.environ['LM_STUDIO_API_KEY'] = api_settings['apiKey']
                settings.LM_STUDIO_API_KEY = api_settings['apiKey']
        
        if 'baseUrl' in api_settings and provider == 'lmstudio':
            os.environ['LM_STUDIO_BASE_URL'] = api_settings['baseUrl']
            settings.LM_STUDIO_BASE_URL = api_settings['baseUrl']
        
        return Response(
            {
                "message": "Settings updated successfully",
                "provider": provider,
                "note": "Settings are temporary and will reset on server restart. For persistent settings, configure environment variables or use a database."
            },
            status=status.HTTP_200_OK
        )
