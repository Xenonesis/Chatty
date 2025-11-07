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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🧠 Conversation Intelligence
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Ask questions about your past conversations and get intelligent answers.
        </p>

        <form onSubmit={handleQuerySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Question
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What topics have I discussed the most? What decisions were made in my conversations?"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Keywords (Optional)
            </label>
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="e.g., python, project, meeting"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Analyzing...' : 'Get Answer'}
          </button>
        </form>

        {answer && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              💡 Answer
            </h3>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{answer}</p>
          </div>
        )}

        {relevantConversations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📚 Relevant Conversations
            </h3>
            <div className="space-y-2">
              {relevantConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
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
