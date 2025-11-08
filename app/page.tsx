'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ConversationsList from '@/components/ConversationsList';
import IntelligenceQuery from '@/components/IntelligenceQuery';
import IntelligenceProfile from '@/components/IntelligenceProfile';
import SettingsModal from '@/components/SettingsModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, History, Brain, Settings, User } from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'chat' | 'conversations' | 'intelligence' | 'profile'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-zinc-950 dark:via-neutral-900 dark:to-stone-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo-icon.svg" alt="ChattyAI Logo" className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ChattyAI
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">AI Conversation Platform</p>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('chat')}
                  variant={activeView === 'chat' ? 'default' : 'outline'}
                  size="icon"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-200 hover:scale-110"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg hidden md:block">
                  Chat
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('conversations')}
                  variant={activeView === 'conversations' ? 'default' : 'outline'}
                  size="icon"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-200 hover:scale-110"
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg hidden md:block">
                  History
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('intelligence')}
                  variant={activeView === 'intelligence' ? 'default' : 'outline'}
                  size="icon"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-200 hover:scale-110"
                >
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg hidden md:block">
                  Intelligence
                </div>
              </div>
              <div className="relative group">
                <Button
                  onClick={() => setActiveView('profile')}
                  variant={activeView === 'profile' ? 'default' : 'outline'}
                  size="icon"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-200 hover:scale-110"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg hidden md:block">
                  Profile
                </div>
              </div>
              <div className="h-4 sm:h-6 w-px bg-border mx-0.5 sm:mx-1"></div>
              <ThemeToggle />
              <div className="relative group">
                <Button
                  onClick={() => setIsSettingsOpen(true)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-200 hover:scale-110"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg hidden md:block">
                  Settings
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
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
          {activeView === 'profile' && <IntelligenceProfile />}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}
