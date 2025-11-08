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
    id: 'openrouter',
    name: 'OpenRouter',
    requiresApiKey: true,
    fields: [
      { name: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-or-v1-...', required: true },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    requiresApiKey: false,
    fields: [
      { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:1234/v1', required: true },
      { name: 'model', label: 'Model', type: 'select', placeholder: 'Select a model', required: false },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    requiresApiKey: false,
    fields: [
      { name: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:11434', required: true },
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

    if ((apiKey && apiKey.length > 10) || ((selectedProvider === 'lmstudio' || selectedProvider === 'ollama') && baseUrl)) {
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

    if (!apiKey && selectedProvider !== 'lmstudio' && selectedProvider !== 'ollama') {
      setValidationMessage('Please enter an API key first');
      setIsValidating(false);
      return;
    }

    try {
      // Use backend API to fetch models (avoids CORS issues)
      const response = await fetch('http://localhost:8000/api/settings/ai/fetch-models/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey,
          baseUrl: baseUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAvailableModels(data.models);
        setValidationMessage(data.message);
      } else {
        setValidationMessage(data.error || 'Failed to fetch models');
      }
    } catch (error) {
      setValidationMessage('Error connecting to backend. Make sure the server is running.');
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
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">AI Settings</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Configure your AI provider and API keys
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Provider Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base">Select AI Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) => {
                setSelectedProvider(value);
                setSettings({});
                setAvailableModels([]);
                setValidationMessage('');
              }}
            >
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Choose a provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id} className="text-sm sm:text-base">
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{provider.name}</span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {provider.requiresApiKey ? '(API)' : '(Local)'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provider Settings */}
          {currentProvider && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">
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
                  <CardContent className="p-2.5 sm:p-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                      {getValidationIcon()}
                      <span className="break-words">{isValidating ? 'Validating...' : validationMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentProvider.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'select' && field.name === 'model' ? (
                    <Select
                      value={settings[field.name] || ''}
                      onValueChange={(value) => setSettings({ ...settings, [field.name]: value })}
                      disabled={isValidating || availableModels.length === 0}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder={
                          isValidating 
                            ? 'Fetching...'
                            : availableModels.length === 0 
                            ? 'Enter API key first' 
                            : 'Select a model'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id} className="text-sm sm:text-base">
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
                      className="text-sm sm:text-base"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1.5 sm:mb-2">How it works:</p>
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                    <li>Enter your API key or connection URL</li>
                    <li>Models are fetched automatically</li>
                    <li>Select your preferred model</li>
                    <li>Settings stored locally</li>
                  </ul>
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs opacity-80">
                    <strong>Security:</strong> API keys stored in browser localStorage
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
              <CardContent className="p-2.5 sm:p-3">
                <p className="text-xs sm:text-sm break-words">{saveMessage}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto" size="sm">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2">Saving...</span>
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
