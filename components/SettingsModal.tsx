'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    const savedProvider = localStorage.getItem('ai_provider') || 'lmstudio';
    const savedSettings = localStorage.getItem('ai_settings');
    setSelectedProvider(savedProvider);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [isOpen]);

  useEffect(() => {
    const apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl;

    if ((apiKey && apiKey.length > 10) || (selectedProvider === 'lmstudio' && baseUrl)) {
      const timeoutId = setTimeout(() => {
        validateApiKey();
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
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
      setValidationMessage('Please enter an API key first');
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
              setValidationMessage(`API key is valid! Found ${models.length} models.`);
            } else {
              const error = await response.json();
              setValidationMessage(`Invalid API key: ${error.error?.message || 'Authentication failed'}`);
            }
          } catch (error) {
            setValidationMessage('Error connecting to OpenAI API. Check your network connection.');
          }
          break;

        case 'anthropic':
          models = [
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
            { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
            { id: 'claude-2.1', name: 'Claude 2.1' },
          ];
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
              setValidationMessage('API key is valid! Available models loaded.');
            } else if (response.status === 401) {
              setValidationMessage('Invalid API key. Please check your Anthropic API key.');
              models = [];
            }
          } catch (error) {
            setValidationMessage('Cannot verify API key. Using default models.');
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
              setValidationMessage(`API key is valid! Found ${models.length} models.`);
            } else {
              setValidationMessage('Invalid API key. Please check your Google API key.');
            }
          } catch (error) {
            setValidationMessage('Error connecting to Google API. Check your network connection.');
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
              setValidationMessage(`Connected to LM Studio! Found ${models.length} local models.`);
            } else {
              setValidationMessage('Cannot connect to LM Studio. Make sure it is running.');
            }
          } catch (error) {
            setValidationMessage('Cannot connect to LM Studio. Check the URL and ensure LM Studio is running.');
          }
          break;
      }

      setAvailableModels(models);
    } catch (error) {
      setValidationMessage('An error occurred during validation.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      localStorage.setItem('ai_provider', selectedProvider);
      localStorage.setItem('ai_settings', JSON.stringify(settings));

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
          setSaveMessage(`Settings saved successfully! ${data.note || ''}`);
        } else {
          throw new Error('Failed to save to backend');
        }
      } catch (backendError) {
        setSaveMessage('Settings saved locally. Note: Backend update failed, changes are temporary.');
      }

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

  const getValidationIcon = () => {
    if (isValidating) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (validationMessage.includes('valid') || validationMessage.includes('Connected')) 
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (validationMessage.includes('Invalid') || validationMessage.includes('Error') || validationMessage.includes('Cannot'))
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (validationMessage.includes('Please'))
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider and API keys
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Select AI Provider</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AI_PROVIDERS.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardContent className="p-4">
                    <div className="font-semibold">{provider.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {provider.requiresApiKey ? 'Requires API key' : 'Local deployment'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Provider Settings */}
          {currentProvider && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {currentProvider.name} Configuration
              </h3>

              {/* Validation Message */}
              {(validationMessage || isValidating) && (
                <Card className={`${
                  isValidating
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : validationMessage.includes('valid') || validationMessage.includes('Connected')
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : validationMessage.includes('Invalid') || validationMessage.includes('Error') || validationMessage.includes('Cannot')
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {getValidationIcon()}
                      <span>{isValidating ? 'Validating API key and fetching models...' : validationMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentProvider.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'select' && field.name === 'model' ? (
                    <Select
                      value={settings[field.name] || ''}
                      onValueChange={(value) => setSettings({ ...settings, [field.name]: value })}
                      disabled={isValidating || availableModels.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isValidating 
                            ? 'Fetching models...'
                            : availableModels.length === 0 
                            ? 'Enter API key to fetch models' 
                            : 'Select a model'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={settings[field.name] || ''}
                      onChange={(e) => {
                        setSettings({ ...settings, [field.name]: e.target.value });
                        if (field.name === 'apiKey') {
                          setValidationMessage('');
                          setAvailableModels([]);
                        }
                      }}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
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
            </CardContent>
          </Card>

          {/* Save Message */}
          {saveMessage && (
            <Card className={saveMessage.includes('Error') 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }>
              <CardContent className="p-3">
                <p className="text-sm">{saveMessage}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
