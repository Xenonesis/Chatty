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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conversations History
            </h2>
            <button
              onClick={loadConversations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No conversations found matching your search.' : 'No conversations yet. Start chatting!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg
                           hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(conversation.start_timestamp).toLocaleDateString()} •{' '}
                          {new Date(conversation.start_timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          conversation.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {conversation.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>💬 {conversation.message_count || 0} messages</span>
                    <span>⏱️ {formatDuration(conversation.duration)}</span>
                  </div>

                  {conversation.ai_summary && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                      {conversation.ai_summary}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Continue Chat
                    </button>
                    <button
                      onClick={() => viewConversationDetails(conversation.id)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Details
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
