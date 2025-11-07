'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Message } from '@/lib/api';

interface ChatInterfaceProps {
  conversationId: number | null;
  onConversationChange: (id: number | null) => void;
}

export default function ChatInterface({ conversationId, onConversationChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
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
      const response = await api.sendMessage(currentConversationId, userMessageContent);
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
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {conversationTitle || 'New Conversation'}
          </h2>
          {conversationId && (
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {conversationId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={startNewConversation}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            New Chat
          </button>
          {conversationId && (
            <button
              onClick={handleEndConversation}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              End & Summarize
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">👋 Start a conversation!</p>
              <p className="text-sm">Type a message below to begin chatting with the AI.</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold opacity-75">
                  {message.sender === 'user' ? '👤 You' : '🤖 AI'}
                </span>
                <span className="text-xs opacity-50">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
