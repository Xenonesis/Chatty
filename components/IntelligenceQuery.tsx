'use client';

import { useState } from 'react';
import { api, Conversation } from '@/lib/api';

export default function IntelligenceQuery() {
  const [query, setQuery] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [answer, setAnswer] = useState('');
  const [relevantConversations, setRelevantConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.queryIntelligence(query, searchKeywords);
      setAnswer(response.answer);
      setRelevantConversations(response.relevant_conversations);
    } catch (error) {
      console.error('Failed to query intelligence:', error);
      alert('Failed to get answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.searchConversations(searchQuery, useSemanticSearch);
      setSearchResults(response.results);
    } catch (error) {
      console.error('Failed to search conversations:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Query Intelligence Panel */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🧠</span>
            </div>
            Conversation Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Ask questions about your past conversations and get intelligent answers powered by AI.
          </p>
        </div>

        <form onSubmit={handleQuerySubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What topics have I discussed the most? What decisions were made in my conversations?"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none
                       placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Filter Keywords (Optional)
            </label>
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="e.g., python, project, meeting"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transform hover:scale-105 disabled:transform-none
                     flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Answer
              </>
            )}
          </button>
        </form>

        {answer && (
          <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl animate-slideUp">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-lg">💡</span>
              </div>
              Answer
            </h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{answer}</p>
          </div>
        )}

        {relevantConversations.length > 0 && (
          <div className="mt-6 animate-slideUp">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Relevant Conversations ({relevantConversations.length})
            </h3>
            <div className="space-y-3">
              {relevantConversations.map((conv, index) => (
                <div
                  key={conv.id}
                  className="p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-md animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{conv.title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conv.start_timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {conv.ai_summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {conv.ai_summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🔍 Search Conversations
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Find conversations by keywords or semantic meaning.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Query
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="semantic"
              checked={useSemanticSearch}
              onChange={(e) => setUseSemanticSearch(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="semantic" className="text-sm text-gray-700 dark:text-gray-300">
              Use semantic search (AI-powered)
            </label>
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Search Results ({searchResults.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{conv.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      conv.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>{new Date(conv.start_timestamp).toLocaleDateString()}</span>
                    <span>💬 {conv.message_count || 0} messages</span>
                  </div>
                  {conv.ai_summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
                      {conv.ai_summary}
                    </p>
                  )}
                  {conv.metadata?.topics && (
                    <div className="flex flex-wrap gap-1">
                      {conv.metadata.topics.slice(0, 3).map((topic: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isLoading && (
          <div className="mt-6 text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No conversations found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
