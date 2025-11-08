'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Message } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, FileText, Send, Loader2 } from 'lucide-react';

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
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await api.getConfiguredProviders();
      console.log('Loaded providers:', response);
      setAvailableProviders(response.providers);
      
      // Check localStorage for user's last selected provider
      const savedProvider = localStorage.getItem('ai_provider');
      console.log('Saved provider from localStorage:', savedProvider);
      console.log('Current provider from backend:', response.current_provider);
      
      // Use saved provider if it exists in available providers, otherwise use backend's current provider
      if (savedProvider && response.providers.some(p => p.id === savedProvider)) {
        console.log('Using saved provider:', savedProvider);
        setSelectedProvider(savedProvider);
      } else if (response.current_provider && response.providers.some(p => p.id === response.current_provider)) {
        console.log('Using backend current provider:', response.current_provider);
        setSelectedProvider(response.current_provider);
      } else {
        const fallbackProvider = response.providers[0]?.id || '';
        console.log('Using fallback provider:', fallbackProvider);
        setSelectedProvider(fallbackProvider);
      }
    } catch (error) {
      console.error('Failed to load configured providers:', error);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      console.log('Loading conversation', id, 'from database...');
      const conversation = await api.getConversation(id);
      const messageCount = conversation.messages?.length || 0;
      console.log('✓ Loaded conversation', id, 'with', messageCount, 'messages from database');
      
      setMessages(conversation.messages || []);
      setConversationTitle(conversation.title);
      
      // Log message details for debugging
      if (messageCount > 0 && conversation.messages) {
        console.log('First message:', conversation.messages[0]);
        console.log('Last message:', conversation.messages[messageCount - 1]);
      } else {
        console.warn('⚠️ Conversation has no messages in database');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      alert('Failed to load conversation from database');
    }
  };

  const startNewConversation = async () => {
    try {
      const conversation = await api.createConversation();
      onConversationChange(conversation.id);
      setMessages([]);
      setConversationTitle(conversation.title);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start new conversation');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    // Ensure we have a valid provider selected
    if (!selectedProvider) {
      alert('Please select an AI provider before sending a message.');
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
        alert('Failed to start conversation. Please check if the backend is running.');
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
      alert('Failed to create conversation. Please try again.');
      setIsLoading(false);
      setInputMessage(userMessageContent); // Restore the message
      return;
    }

    try {
      // Only send provider if it's actually selected
      const providerToSend = selectedProvider || undefined;
      console.log('Sending message - conversationId:', currentConversationId, 'content:', userMessageContent, 'provider:', providerToSend);
      const response = await api.sendMessage(currentConversationId, userMessageContent, providerToSend);
      
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
      alert('Failed to send message. Please try again.');
      setInputMessage(userMessageContent); // Restore the message so user can try again
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
      alert(`Conversation ended!\n\nSummary: ${result.summary}`);
      onConversationChange(null);
      setMessages([]);
      setConversationTitle('');
    } catch (error) {
      console.error('Failed to end conversation:', error);
      alert('Failed to end conversation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b">
        <div className="flex-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {conversationTitle || 'New Conversation'}
          </h2>
          {conversationId && (
            <p className="text-sm text-muted-foreground mt-1">Session #{conversationId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={startNewConversation}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
          {conversationId && (
            <Button
              onClick={handleEndConversation}
              variant="destructive"
            >
              <FileText className="w-4 h-4" />
              End & Summarize
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
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
            key={`${message.id}-${message.sender}-${index}`}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Card
              className={`max-w-[75%] ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : ''
              }`}
            >
              <CardContent className="px-5 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={message.sender === 'user' ? 'default' : 'secondary'} className="rounded-full w-6 h-6 p-0 flex items-center justify-center">
                    {message.sender === 'user' ? '👤' : '🤖'}
                  </Badge>
                  <span className={`text-xs font-semibold ${
                    message.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {message.sender === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className={`text-xs ${
                    message.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
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
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-3">
          {availableProviders.length > 0 && (
            <div className="flex flex-col gap-1">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                disabled={isLoading}
              >
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableProviders.find(p => p.id === selectedProvider)?.model && (
                <span className="text-xs text-muted-foreground px-1">
                  Model: {availableProviders.find(p => p.id === selectedProvider)?.model}
                </span>
              )}
            </div>
          )}
          <Input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading || availableProviders.length === 0}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || availableProviders.length === 0 || !selectedProvider}
            className="px-8"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
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
    </Card>
  );
}
