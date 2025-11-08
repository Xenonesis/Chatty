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
import { Brain, Search, Zap, Lightbulb, Loader2, MessageCircle, Calendar } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Conversation Intelligence</CardTitle>
              <CardDescription>
                Ask questions about your past conversations and get intelligent answers powered by AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleQuerySubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Your Question
              </Label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What topics have I discussed the most? What decisions were made in my conversations?"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Filter Keywords (Optional)
              </Label>
              <Input
                type="text"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="e.g., python, project, meeting"
              />
            </div>

            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Get Answer
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
            <div className="mt-6 space-y-3 animate-slideUp">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Relevant Conversations ({relevantConversations.length})
              </h3>
              <div className="space-y-3">
                {relevantConversations.map((conv, index) => (
                  <Card
                    key={conv.id}
                    className="hover:border-primary transition-all hover:shadow-md animate-slideUp"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{conv.title}</h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conv.start_timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {conv.ai_summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
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
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6" />
            Search Conversations
          </CardTitle>
          <CardDescription>
            Find conversations by keywords or semantic meaning.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label>Search Query</Label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search terms..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="semantic"
                checked={useSemanticSearch}
                onCheckedChange={(checked) => setUseSemanticSearch(checked as boolean)}
              />
              <Label htmlFor="semantic" className="text-sm cursor-pointer">
                Use semantic search (AI-powered)
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!searchQuery.trim() || isLoading}
              className="w-full"
              variant="secondary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((conv) => (
                  <Card key={conv.id} className="hover:border-primary transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{conv.title}</h4>
                        <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                          {conv.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
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
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                          {conv.ai_summary}
                        </p>
                      )}
                      {conv.metadata?.topics && (
                        <div className="flex flex-wrap gap-1">
                          {conv.metadata.topics.slice(0, 3).map((topic: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
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
    </div>
  );
}
