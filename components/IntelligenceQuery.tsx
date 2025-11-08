'use client';

import { useState } from 'react';
import { api, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Search, Zap, Lightbulb, Loader2, MessageCircle, Calendar, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function IntelligenceQuery() {
  const [query, setQuery] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [answer, setAnswer] = useState('');
  const [relevantConversations, setRelevantConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration: number = 5000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await api.queryIntelligence(query, searchKeywords);
      setAnswer(response.answer);
      setRelevantConversations(response.relevant_conversations);
      showNotification('success', 'Answer generated successfully!', 3000);
    } catch (error) {
      console.error('Failed to query intelligence:', error);
      showNotification('error', 'Failed to get answer. Please try again.');
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
      showNotification('success', `Found ${response.results.length} conversation(s)`, 3000);
    } catch (error) {
      console.error('Failed to search conversations:', error);
      showNotification('error', 'Failed to search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Query Intelligence Panel */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">
                <span className="hidden sm:inline">Conversation Intelligence</span>
                <span className="sm:hidden">Intelligence</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Ask questions about your past conversations
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleQuerySubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                Your Question
              </Label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What topics have I discussed the most?"
                rows={4}
                className="resize-none text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm sm:text-base">
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                Filter Keywords (Optional)
              </Label>
              <Input
                type="text"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="e.g., python, project, meeting"
                className="text-sm sm:text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span className="ml-2">Get Answer</span>
                </>
              )}
            </Button>
          </form>

          {answer && (
            <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 animate-slideUp">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
              </CardContent>
            </Card>
          )}

          {relevantConversations.length > 0 && (
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 animate-slideUp">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Relevant ({relevantConversations.length})
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {relevantConversations.map((conv, index) => (
                  <Card
                    key={conv.id}
                    className="hover:border-primary transition-all hover:shadow-md animate-slideUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{conv.title}</h4>
                        <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.start_timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {conv.ai_summary && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {conv.ai_summary}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Panel */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            Search Conversations
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Find conversations by keywords or semantic meaning
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Search Query</Label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search terms..."
                className="text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="semantic"
                checked={useSemanticSearch}
                onCheckedChange={(checked) => setUseSemanticSearch(checked as boolean)}
              />
              <Label htmlFor="semantic" className="text-xs sm:text-sm cursor-pointer">
                Use semantic search (AI-powered)
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="w-full"
              variant="secondary"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="ml-2">Search</span>
                </>
              )}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">
                Results ({searchResults.length})
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {searchResults.map((conv) => (
                  <Card key={conv.id} className="hover:border-primary transition-all">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-2">
                        <h4 className="font-semibold text-sm sm:text-base truncate flex-1">{conv.title}</h4>
                        <Badge variant={conv.status === 'active' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                          {conv.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.start_timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {conv.message_count || 0} messages
                        </span>
                      </div>
                      {conv.ai_summary && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-1.5 sm:mb-2">
                          {conv.ai_summary}
                        </p>
                      )}
                      {conv.metadata?.topics && (
                        <div className="flex flex-wrap gap-1">
                          {conv.metadata.topics.slice(0, 3).map((topic: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isLoading && (
            <div className="mt-6 text-center py-8">
              <p className="text-muted-foreground">
                No conversations found matching your search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-slideDown max-w-sm sm:max-w-md">
          <Card className={`shadow-lg ${
            notification.type === 'success' ? 'border-green-500' : 
            notification.type === 'error' ? 'border-red-500' : 
            notification.type === 'warning' ? 'border-yellow-500' : 
            'border-blue-500'
          }`}>
            <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />}
              {notification.type === 'error' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />}
              {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />}
              <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
