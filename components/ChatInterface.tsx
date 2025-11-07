'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Message } from '@/lib/api';

interface ChatInterfaceProps {
  conversationId: number | null;
  onConversationChange: (id: number | null) => void;
}

interface AIProvider {
  id: string;
  name: string;
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
  }, []);

  const loadConfiguredProviders = async () => {
    try {
      const response = await api.getConfiguredProviders();
      setAvailableProviders(response.providers);
      setSelectedProvider(response.current_provider || (response.providers[0]?.id || ''));
    } catch (error) {
      console.error('Failed to load configured providers:', error);
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const conversation = await api.getConversation(id);
      setMessages(conversation.messages || []);
      setConversationTitle(conversation.title);
    } catch (error) {
      console.error('Failed to load conversation:', error);
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

    // Create conversation if needed
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const conversation = await api.createConversation();
        currentConversationId = conversation.id;
        onConversationChange(conversation.id);
        setConversationTitle(conversation.title);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        alert('Failed to start conversation');
        return;
      }
    }

    const userMessageContent = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.sendMessage(currentConversationId, userMessageContent, selectedProvider);
      setMessages((prev) => [...prev, response.user_message, response.ai_message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
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
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💬</span>
            {conversationTitle || 'New Conversation'}
          </h2>
          {conversationId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">Session #{conversationId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={startNewConversation}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          {conversationId && (
            <button
              onClick={handleEndConversation}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-md font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              End & Summarize
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-blue-50/30 dark:to-gray-900/30">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-5xl">💭</span>
              </div>
              <p className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Start a Conversation</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything! I'm here to help with information, ideas, or just a friendly chat.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  message.sender === 'user' 
                    ? 'bg-blue-700' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}>
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <span className={`text-xs font-semibold ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {message.sender === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <span className={`text-xs ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-slideUp">
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-3">
          {availableProviders.length > 0 && (
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              disabled={isLoading}
              className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       font-medium text-sm min-w-[200px]"
              title="Select AI Provider"
            >
              {availableProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading || availableProviders.length === 0}
            className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || availableProviders.length === 0}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     font-semibold shadow-lg transform hover:scale-105 disabled:transform-none
                     flex items-center gap-2"
          >
            <span>Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {availableProviders.length === 0 && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
            No AI providers configured. Please configure an AI provider in settings.
          </p>
        )}
      </form>
    </div>
  );
}
