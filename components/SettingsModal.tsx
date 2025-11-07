'use client';

import { useState, useEffect } from 'react';

interface AIProvider {
  id: string;
  name: string;
  requiresApiKey: boolean;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required: boolean;
  }[];
}

interface AIModel {
  id: string;
  name: string;
  description?: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI (GPT-4, GPT-3.5)',
    requiresApiKey: true,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-proj-...', required: true },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    requiresApiKey: true,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-ant-...', required: true },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    requiresApiKey: true,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'AIza...', required: true },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    requiresApiKey: false,
    fields: [
      { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:1234/v1', required: true },
      { name: 'apiKey', label: 'API Key', type: 'text', placeholder: 'lm-studio', required: false },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedProvider, setSelectedProvider] = useState('lmstudio');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedProvider = localStorage.getItem('ai_provider') || 'lmstudio';
    const savedSettings = localStorage.getItem('ai_settings');
    setSelectedProvider(savedProvider);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [isOpen]);

  // Auto-fetch models when API key changes
  useEffect(() => {
    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl;

    // Only auto-fetch if we have credentials
    if ((apiKey && apiKey.length > 10) || (selectedProvider === 'lmstudio' && baseUrl)) {
      // Debounce the validation to avoid too many API calls
      const timeoutId = setTimeout(() => {
        validateApiKey();
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      // Clear models if API key is removed or too short
      setAvailableModels([]);
      setValidationMessage('');
    }
  }, [settings.apiKey, settings.baseUrl, selectedProvider]);

  const validateApiKey = async () => {
    setIsValidating(true);
    setValidationMessage('');
    setAvailableModels([]);

    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl;

    if (!apiKey && selectedProvider !== 'lmstudio') {
      setValidationMessage('⚠️ Please enter an API key first');
      setIsValidating(false);
      return;
    }

    try {
      let models: AIModel[] = [];

      switch (selectedProvider) {
        case 'openai':
          try {
            const response = await fetch('https://api.openai.com/v1/models', {
              headers: { 'Authorization': `Bearer ${apiKey}` },
            });
            
            if (response.ok) {
              const data = await response.json();
              models = data.data
                .filter((m: any) => m.id.includes('gpt'))
                .map((m: any) => ({ id: m.id, name: m.id }))
                .sort((a: AIModel, b: AIModel) => b.id.localeCompare(a.id));
              setValidationMessage('✅ API key is valid! Found ' + models.length + ' models.');
            } else {
              const error = await response.json();
              setValidationMessage('❌ Invalid API key: ' + (error.error?.message || 'Authentication failed'));
            }
          } catch (error) {
            setValidationMessage('❌ Error connecting to OpenAI API. Check your network connection.');
          }
          break;

        case 'anthropic':
          // Anthropic doesn't have a public models endpoint, provide default models
          models = [
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
            { id: 'claude-2.1', name: 'Claude 2.1' },
          ];
          // Test with a simple API call
          try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1,
                messages: [{ role: 'user', content: 'test' }]
              }),
            });
            
            if (response.status === 400 || response.ok) {
              setValidationMessage('✅ API key is valid! Available models loaded.');
            } else if (response.status === 401) {
              setValidationMessage('❌ Invalid API key. Please check your Anthropic API key.');
              models = [];
            }
          } catch (error) {
            setValidationMessage('⚠️ Cannot verify API key. Using default models.');
          }
          break;

        case 'google':
          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            
            if (response.ok) {
              const data = await response.json();
              models = data.models
                .filter((m: any) => m.name.includes('gemini'))
                .map((m: any) => ({ 
                  id: m.name.replace('models/', ''), 
                  name: m.displayName || m.name 
                }));
              setValidationMessage('✅ API key is valid! Found ' + models.length + ' models.');
            } else {
              setValidationMessage('❌ Invalid API key. Please check your Google API key.');
            }
          } catch (error) {
            setValidationMessage('❌ Error connecting to Google API. Check your network connection.');
          }
          break;

        case 'lmstudio':
          try {
            const url = baseUrl || 'http://localhost:1234/v1';
            const response = await fetch(`${url}/models`, {
              headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
            });
            
            if (response.ok) {
              const data = await response.json();
              models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
              setValidationMessage('✅ Connected to LM Studio! Found ' + models.length + ' local models.');
            } else {
              setValidationMessage('❌ Cannot connect to LM Studio. Make sure it is running.');
            }
          } catch (error) {
            setValidationMessage('❌ Cannot connect to LM Studio. Check the URL and ensure LM Studio is running.');
          }
          break;
      }

      setAvailableModels(models);
    } catch (error) {
      setValidationMessage('❌ An error occurred during validation.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Save to localStorage for client-side persistence
      localStorage.setItem('ai_provider', selectedProvider);
      localStorage.setItem('ai_settings', JSON.stringify(settings));

      // Send to backend to update server-side settings
      try {
        const response = await fetch('http://localhost:8000/api/settings/ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider: selectedProvider, settings }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSaveMessage('Settings saved successfully! ' + (data.note || ''));
        } else {
          throw new Error('Failed to save to backend');
        }
      } catch (backendError) {
        // If backend fails, still save locally
        setSaveMessage('Settings saved locally. Note: Backend update failed, changes are temporary.');
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('ai-settings-updated'));

      setTimeout(() => {
        setSaveMessage('');
        onClose();
      }, 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your AI provider and API keys</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select AI Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{provider.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {provider.requiresApiKey ? 'Requires API key' : 'Local deployment'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Settings */}
          {currentProvider && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentProvider.name} Configuration
              </h3>

              {/* Validation Message */}
              {(validationMessage || isValidating) && (
                <div className={`p-3 rounded-lg text-sm font-medium animate-slideUp flex items-center gap-2 ${
                  isValidating
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                    : validationMessage.includes('✅') 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                    : validationMessage.includes('❌')
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                }`}>
                  {isValidating && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  )}
                  <span>{isValidating ? 'Validating API key and fetching models...' : validationMessage}</span>
                </div>
              )}

              {currentProvider.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' && field.name === 'model' ? (
                    <select
                      value={settings[field.name] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.name]: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      disabled={isValidating || availableModels.length === 0}
                    >
                      <option value="">
                        {isValidating 
                          ? 'Fetching models...'
                          : availableModels.length === 0 
                          ? 'Enter API key to fetch models' 
                          : 'Select a model'}
                      </option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={settings[field.name] || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, [field.name]: e.target.value });
                        // Clear validation when API key changes
                        if (field.name === 'apiKey') {
                          setValidationMessage('');
                          setAvailableModels([]);
                        }
                      }}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-2">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enter your API key or connection URL</li>
                  <li>Models are automatically fetched and validated in real-time</li>
                  <li>Select your preferred model from the dropdown</li>
                  <li>Your settings are stored locally and sent to the backend</li>
                </ul>
                <p className="mt-2 text-xs opacity-80">
                  <strong>Security:</strong> API keys are stored in your browser localStorage. For production, implement server-side key management.
                </p>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              saveMessage.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
