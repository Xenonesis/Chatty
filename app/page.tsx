'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ConversationsList from '@/components/ConversationsList';
import IntelligenceQuery from '@/components/IntelligenceQuery';
import SettingsModal from '@/components/SettingsModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, History, Brain, Settings } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'chat' | 'conversations' | 'intelligence'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-zinc-950 dark:via-neutral-900 dark:to-stone-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 via-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-700 via-slate-600 to-zinc-700 dark:from-gray-300 dark:via-slate-300 dark:to-zinc-300 bg-clip-text text-transparent">
                  Chatty
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Conversation Platform</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('chat')}
                  variant={activeView === 'chat' ? 'default' : 'outline'}
                  size="icon"
                  className="w-10 h-10 transition-all duration-200 hover:scale-110"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                  Chat
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('conversations')}
                  variant={activeView === 'conversations' ? 'default' : 'outline'}
                  size="icon"
                  className="w-10 h-10 transition-all duration-200 hover:scale-110"
                >
                  <History className="w-5 h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                  History
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('intelligence')}
                  variant={activeView === 'intelligence' ? 'default' : 'outline'}
                  size="icon"
                  className="w-10 h-10 transition-all duration-200 hover:scale-110"
                >
                  <Brain className="w-5 h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                  Intelligence
                </div>
              </div>
              <div className="h-6 w-px bg-border mx-1"></div>
              <ThemeToggle />
              <div className="relative group">
                <Button
                  onClick={() => setIsSettingsOpen(true)}
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 transition-all duration-200 hover:scale-110"
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg">
                  Settings
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
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
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}
