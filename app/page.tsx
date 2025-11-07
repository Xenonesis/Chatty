'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ConversationsList from '@/components/ConversationsList';
import IntelligenceQuery from '@/components/IntelligenceQuery';

export default function Home() {
  const [activeView, setActiveView] = useState<'chat' | 'conversations' | 'intelligence'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🤖 AI Chat Portal
            </h1>
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveView('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveView('conversations')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'conversations'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveView('intelligence')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'intelligence'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Intelligence
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'chat' && (
          <ChatInterface
            conversationId={selectedConversationId}
            onConversationChange={setSelectedConversationId}
          />
        )}
        {activeView === 'conversations' && (
          <ConversationsList
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              setActiveView('chat');
            }}
          />
        )}
        {activeView === 'intelligence' && <IntelligenceQuery />}
      </main>
    </div>
  );
}
