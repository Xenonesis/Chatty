'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, FileText, Send, Loader2, Sparkles, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatInterfaceProps {
  conversationId: number | null;
  onConversationChange: (id: number | null) => void;
}

interface AIProvider {
  id: string;
  name: string;
  model?: string | null;
}

export default function ChatInterface({ conversationId, onConversationChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const [conversationStatus, setConversationStatus] = useState<string>('active');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [endedConversationDialog, setEndedConversationDialog] = useState<{ open: boolean; message: string } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    // Load configured AI providers on mount
    loadConfiguredProviders();

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai_provider' || e.key === 'ai_settings') {
        loadConfiguredProviders();
      }
    };

    // Listen for custom event when settings modal closes
    const handleSettingsUpdate = () => {
      loadConfiguredProviders();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ai-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ai-settings-updated', handleSettingsUpdate);
    };
  }, []);

  const loadConfiguredProviders = async () => {
    try {
      // First check localStorage for user's configured provider and model
      const savedProvider = localStorage.getItem('ai_provider');
      const savedSettings = localStorage.getItem('ai_settings');
      let savedModel = '';
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          savedModel = settings.model || '';
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }
      
      console.log('Saved provider from localStorage:', savedProvider);
      console.log('Saved model from localStorage:', savedModel);
      
      // Get configured providers from backend
      const response = await api.getConfiguredProviders();
      console.log('Backend configured providers:', response);
      
      // If user has a saved provider in localStorage, add it to the list if not already there
      const providers: AIProvider[] = [...response.providers.map(p => ({ ...p, model: null }))];
      
      if (savedProvider && !providers.some(p => p.id === savedProvider)) {
        // Add the saved provider to the list (it's configured in localStorage but not in backend)
        const providerNames: Record<string, string> = {
          'openai': 'OpenAI (GPT-4, GPT-3.5)',
          'anthropic': 'Anthropic (Claude)',
          'google': 'Google (Gemini)',
          'openrouter': 'OpenRouter',
          'lmstudio': 'LM Studio (Local)',
          'ollama': 'Ollama (Local)'
        };
        
        providers.push({
          id: savedProvider,
          name: providerNames[savedProvider] || savedProvider,
          model: savedModel || null
        });
        console.log('Added localStorage provider to list:', savedProvider);
      }
      
      setAvailableProviders(providers);
      
      // Determine which provider to use
      let providerToUse = '';
      
      if (savedProvider && providers.some(p => p.id === savedProvider)) {
        // Use localStorage saved provider (highest priority)
        providerToUse = savedProvider;
        console.log('Using saved provider from localStorage:', savedProvider);
      } else if (response.current_provider && providers.some(p => p.id === response.current_provider)) {
        // Use backend's current provider
        providerToUse = response.current_provider;
        console.log('Using backend current provider:', response.current_provider);
      } else if (providers.length > 0) {
        // Fallback to first available provider
        providerToUse = providers[0].id;
        console.log('Using fallback provider:', providerToUse);
      }
      
      setSelectedProvider(providerToUse);
      
      // Set the saved model
      if (savedModel) {
        console.log('Using saved model:', savedModel);
        setSelectedModel(savedModel);
      }
    } catch (error) {
      console.error('Failed to load configured providers:', error);
      
      // Fallback to localStorage if backend fails
      const savedProvider = localStorage.getItem('ai_provider');
      const savedSettings = localStorage.getItem('ai_settings');
      
      if (savedProvider) {
        const providerNames: Record<string, string> = {
          'openai': 'OpenAI (GPT-4, GPT-3.5)',
          'anthropic': 'Anthropic (Claude)',
          'google': 'Google (Gemini)',
          'openrouter': 'OpenRouter',
          'lmstudio': 'LM Studio (Local)',
          'ollama': 'Ollama (Local)'
        };
        
        let savedModel = '';
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            savedModel = settings.model || '';
          } catch (e) {
            console.error('Failed to parse saved settings:', e);
          }
        }
        
        setAvailableProviders([{
          id: savedProvider,
          name: providerNames[savedProvider] || savedProvider,
          model: savedModel || null
        }]);
        setSelectedProvider(savedProvider);
        setSelectedModel(savedModel);
        console.log('Using localStorage fallback:', savedProvider, savedModel);
      }
    }
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const loadConversation = async (id: number) => {
    try {
      console.log('Loading conversation', id, 'from database...');
      const conversation = await api.getConversation(id);
      const messageCount = conversation.messages?.length || 0;
      console.log('✓ Loaded conversation', id, 'with', messageCount, 'messages from database');
      
      setMessages(conversation.messages || []);
      setConversationTitle(conversation.title);
      setConversationSummary(conversation.ai_summary || '');
      setConversationStatus(conversation.status || 'active');
      
      // Log message details for debugging
      if (messageCount > 0 && conversation.messages) {
        console.log('First message:', conversation.messages[0]);
        console.log('Last message:', conversation.messages[messageCount - 1]);
      } else {
        console.warn('⚠️ Conversation has no messages in database');
      }
      
      // Show info if conversation is ended
      if (conversation.status === 'ended') {
        showNotification('info', 'This conversation has ended. Start a new conversation to continue chatting.', 7000);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      showNotification('error', 'Failed to load conversation from database');
    }
  };

  const startNewConversation = async () => {
    try {
      const conversation = await api.createConversation();
      onConversationChange(conversation.id);
      setMessages([]);
      setConversationTitle(conversation.title);
      setConversationSummary('');
      setConversationStatus('active');
      showNotification('success', 'New conversation started!', 3000);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      showNotification('error', 'Failed to start new conversation');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    // Ensure we have a valid provider selected
    if (!selectedProvider) {
      showNotification('warning', 'Please select an AI provider before sending a message.');
      return;
    }
    
    // Check if conversation is ended
    if (conversationStatus === 'ended') {
      setEndedConversationDialog({ open: true, message: inputMessage.trim() });
      return;
    }

    // Create conversation if needed
    let currentConversationId = conversationId;
    console.log('Current conversationId:', currentConversationId);
    
    if (!currentConversationId || currentConversationId === undefined || currentConversationId === null) {
      console.log('No conversation exists, creating new one...');
      try {
        const conversation = await api.createConversation();
        console.log('API returned conversation:', conversation);
        
        if (!conversation || !conversation.id) {
          throw new Error('Invalid conversation response from API');
        }
        
        currentConversationId = conversation.id;
        console.log('Created conversation with ID:', currentConversationId);
        onConversationChange(conversation.id);
        setConversationTitle(conversation.title);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        showNotification('error', 'Failed to start conversation. Please check if the backend is running.');
        setIsLoading(false);
        setInputMessage(inputMessage); // Restore message
        return;
      }
    }

    const userMessageContent = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Final validation before sending
    if (!currentConversationId) {
      console.error('CRITICAL: No conversation ID after creation attempt!');
      showNotification('error', 'Failed to create conversation. Please try again.');
      setIsLoading(false);
      setInputMessage(userMessageContent); // Restore the message
      return;
    }

    try {
      // Only send provider and model if they're actually selected
      const providerToSend = selectedProvider || undefined;
      const modelToSend = selectedModel || undefined;
      console.log('Sending message - conversationId:', currentConversationId, 'content:', userMessageContent, 'provider:', providerToSend, 'model:', modelToSend);
      const response = await api.sendMessage(currentConversationId, userMessageContent, providerToSend, modelToSend);
      
      // Verify that messages have IDs (meaning they were saved to database)
      if (!response.user_message.id || !response.ai_message.id) {
        console.error('ERROR: Messages were not saved to database!', response);
        throw new Error('Messages were not properly saved to database');
      }
      
      console.log('✓ Messages saved to database - User message ID:', response.user_message.id, 'AI message ID:', response.ai_message.id);
      
      // Update local state with the saved messages
      setMessages((prev) => [...prev, response.user_message, response.ai_message]);
      
      // Verify messages were saved by reloading the conversation
      // This ensures we're always showing what's actually in the database
      setTimeout(async () => {
        try {
          const verification = await api.getConversation(currentConversationId);
          console.log('✓ Verification: Conversation has', verification.messages?.length, 'messages in database');
          
          // If there's a mismatch, reload from database
          if (verification.messages && verification.messages.length !== messages.length + 2) {
            console.warn('Message count mismatch detected, reloading from database');
            setMessages(verification.messages);
          }
        } catch (verifyError) {
          console.warn('Could not verify message persistence:', verifyError);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Check if the error is about an ended conversation
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Cannot send messages to an ended conversation')) {
        // Show dialog to start a new conversation
        setEndedConversationDialog({ open: true, message: userMessageContent });
      } else {
        // Other error - show notification
        showNotification('error', 'Failed to send message. Please try again.');
        setInputMessage(userMessageContent); // Restore the message so user can try again
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const result = await api.generateSummary(conversationId);
      setConversationSummary(result.summary);
      showNotification('success', 'Summary generated successfully!', 3000);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      showNotification('error', 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (!conversationId) return;

    const confirmed = confirm('Are you sure you want to end this conversation? A summary will be generated.');
    if (!confirmed) return;

    try {
      setIsLoading(true);
      const result = await api.endConversation(conversationId);
      setConversationSummary(result.summary);
      setConversationStatus('ended');
      showNotification('success', `Conversation ended! Summary: ${result.summary}`, 7000);
    } catch (error) {
      console.error('Failed to end conversation:', error);
      showNotification('error', 'Failed to end conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversationWithMessage = async () => {
    if (!endedConversationDialog) return;
    
    const messageToSend = endedConversationDialog.message;
    setEndedConversationDialog(null);
    setIsLoading(true);
    
    try {
      // Create a new conversation
      const conversation = await api.createConversation();
      onConversationChange(conversation.id);
      setMessages([]);
      setConversationTitle(conversation.title);
      setConversationSummary('');
      setConversationStatus('active');
      
      // Send the message to the new conversation
      const response = await api.sendMessage(
        conversation.id, 
        messageToSend, 
        selectedProvider || undefined, 
        selectedModel || undefined
      );
      
      // Update local state with the saved messages
      setMessages([response.user_message, response.ai_message]);
      showNotification('success', 'New conversation started with your message!', 3000);
      
      console.log('✓ Message sent to new conversation');
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      showNotification('error', 'Failed to start new conversation. Please try again.');
      setInputMessage(messageToSend); // Restore message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 border-b p-3 sm:p-4 md:p-6">
        <div className="flex-1 w-full sm:w-auto">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">{conversationTitle || 'New Conversation'}</span>
          </h2>
          {conversationId && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Session #{conversationId}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            onClick={startNewConversation}
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline ml-1">New Chat</span>
          </Button>
          {conversationId && messages.length > 0 && (
            <Button
              onClick={handleGenerateSummary}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline ml-1">Summary</span>
            </Button>
          )}
          {conversationId && conversationStatus === 'active' && (
            <Button
              onClick={handleEndConversation}
              variant="destructive"
              size="sm"
              disabled={isLoading}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden md:inline ml-1">End</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        {/* Display conversation summary if it exists */}
        {conversationSummary && (
          <Card className="bg-accent/50 border-primary/30 animate-slideDown">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    Conversation Summary
                    <Badge variant="outline" className="text-xs">
                      {conversationStatus === 'ended' ? 'Ended' : 'Generated'}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {conversationSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {messages.length === 0 && !conversationSummary && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
              <p className="text-xl font-semibold mb-3">Start a Conversation</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything! I'm here to help with information, ideas, or just a friendly chat.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id || `temp-${message.sender}-${message.timestamp}-${index}`}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Card
              className={`max-w-[95%] sm:max-w-[85%] md:max-w-[75%] ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : ''
              }`}
            >
              <CardContent className="px-3 py-2 sm:px-4 sm:py-3 md:px-5">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Badge variant={message.sender === 'user' ? 'default' : 'secondary'} className="rounded-full w-5 h-5 sm:w-6 sm:h-6 p-0 flex items-center justify-center text-xs">
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </Badge>
                  <span className={`text-[10px] sm:text-xs font-semibold ${
                    message.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {message.sender === 'user' ? 'You' : 'AI'}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${
                    message.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">{message.content}</p>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-slideUp">
            <Card className="px-5 py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">AI is thinking...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-2 sm:p-3 md:p-4 border-t">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {availableProviders.length > 0 && (
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:min-w-[180px] md:min-w-[200px] text-xs sm:text-sm">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id} className="text-xs sm:text-sm">
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(selectedModel || availableProviders.find(p => p.id === selectedProvider)?.model) && (
                <span className="text-[10px] sm:text-xs text-muted-foreground px-1 truncate">
                  Model: {selectedModel || availableProviders.find(p => p.id === selectedProvider)?.model}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2 flex-1">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={conversationStatus === 'ended' ? 'Conversation ended...' : 'Type message...'}
              disabled={isLoading || availableProviders.length === 0 || conversationStatus === 'ended'}
              className="flex-1 text-sm sm:text-base"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || availableProviders.length === 0 || !selectedProvider || conversationStatus === 'ended'}
              className="px-3 sm:px-6 md:px-8"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <Send className="w-4 h-4 sm:ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
        {availableProviders.length === 0 && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 mt-2">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    No AI providers configured
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Please configure at least one AI provider (OpenAI, Anthropic, Google, or LM Studio) 
                    in the settings to start chatting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-slideDown max-w-sm sm:max-w-md">
          <Card className={`shadow-lg ${
            notification.type === 'success' ? 'border-green-500' : 
            notification.type === 'error' ? 'border-red-500' : 
            notification.type === 'warning' ? 'border-yellow-500' : 
            'border-blue-500'
          }`}>
            <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />}
              {notification.type === 'error' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />}
              {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />}
              <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ended Conversation Dialog */}
      <Dialog open={endedConversationDialog?.open || false} onOpenChange={(open) => {
        if (!open) {
          setEndedConversationDialog(null);
          setInputMessage(endedConversationDialog?.message || '');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-5 h-5" />
              Conversation Has Ended
            </DialogTitle>
            <DialogDescription className="pt-4">
              This conversation has been ended and is now read-only.
              <br />
              <br />
              Would you like to start a new conversation with your message?
              <br />
              <br />
              <span className="text-sm italic text-muted-foreground">
                "{endedConversationDialog?.message}"
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setInputMessage(endedConversationDialog?.message || '');
                setEndedConversationDialog(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleStartNewConversationWithMessage}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Conversation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
