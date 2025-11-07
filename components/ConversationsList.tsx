'use client';

import { useState, useEffect } from 'react';
import { api, Conversation } from '@/lib/api';

interface ConversationsListProps {
  onSelectConversation: (id: number) => void;
}

export default function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(
        (conv) =>
          conv.title.toLowerCase().includes(query) ||
          conv.ai_summary?.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await api.getConversations();
      setConversations(data);
      setFilteredConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      alert('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const viewConversationDetails = async (id: number) => {
    try {
      const conversation = await api.getConversation(id);
      setSelectedConv(conversation);
    } catch (error) {
      console.error('Failed to load conversation details:', error);
      alert('Failed to load conversation details');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-2">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Conversation History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredConversations?.length || 0} conversation{filteredConversations?.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={loadConversations}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or summary..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading conversations...</p>
            </div>
          ) : !filteredConversations || filteredConversations.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-5xl">📭</span>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try a different search term.' : 'Start chatting to see your conversations here!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredConversations) && filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                           hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer
                           bg-white dark:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5
                           animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-xl">💬</span>
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(conversation.start_timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(conversation.start_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          conversation.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {conversation.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <strong>{conversation.message_count || 0}</strong> messages
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDuration(conversation.duration)}
                    </span>
                  </div>

                  {conversation.ai_summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 italic bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border-l-4 border-blue-400">
                      "{conversation.ai_summary}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Continue Chat
                    </button>
                    <button
                      onClick={() => viewConversationDetails(conversation.id)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg
                               hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation Details Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sticky top-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Conversation Details
          </h3>

          {selectedConv ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                <p className="text-gray-900 dark:text-white">{selectedConv.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <p className="text-gray-900 dark:text-white capitalize">{selectedConv.status}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</label>
                <p className="text-gray-900 dark:text-white">{selectedConv.message_count || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</label>
                <p className="text-gray-900 dark:text-white">{formatDuration(selectedConv.duration)}</p>
              </div>

              {selectedConv.ai_summary && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Summary</label>
                  <p className="text-gray-900 dark:text-white text-sm">{selectedConv.ai_summary}</p>
                </div>
              )}

              {selectedConv.metadata?.topics && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Topics</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedConv.metadata.topics.map((topic: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedConv.messages && selectedConv.messages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Recent Messages
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedConv.messages.slice(0, 5).map((msg) => (
                      <div
                        key={msg.id}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                      >
                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {msg.sender === 'user' ? '👤 You' : '🤖 AI'}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Select a conversation to view details
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
