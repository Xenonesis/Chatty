'use client';

import { useState, useEffect } from 'react';
import { api, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Calendar, Clock, MessageCircle, Eye } from 'lucide-react';

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Conversation History
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredConversations?.length || 0} conversation{filteredConversations?.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button
                onClick={loadConversations}
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>

          {/* Search */}
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or summary..."
                className="pl-10"
              />
            </div>

          {isLoading ? (
            <div className="text-center py-16 animate-fadeIn">
              <RefreshCw className="inline-block animate-spin h-12 w-12 text-primary" />
              <p className="mt-4 text-muted-foreground font-medium">Loading conversations...</p>
            </div>
          ) : !filteredConversations || filteredConversations.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term.' : 'Start chatting to see your conversations here!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredConversations) && filteredConversations.map((conversation, index) => (
                <Card
                  key={conversation.id}
                  className="hover:border-primary transition-all cursor-pointer hover:shadow-lg animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(conversation.start_timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(conversation.start_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                          {conversation.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3 bg-muted/50 rounded-lg p-3">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <strong>{conversation.message_count || 0}</strong> messages
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDuration(conversation.duration)}
                    </span>
                  </div>

                  {conversation.ai_summary && (
                    <p className="text-sm mb-4 line-clamp-2 italic bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                      "{conversation.ai_summary}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex-1"
                      variant="default"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Continue Chat
                    </Button>
                    <Button
                      onClick={() => viewConversationDetails(conversation.id)}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                  </div>
                </CardContent>
                </Card>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Conversation Details Panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Conversation Details</CardTitle>
          </CardHeader>
          <CardContent>
          {selectedConv ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="font-medium">{selectedConv.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={selectedConv.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {selectedConv.status}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Messages</label>
                <p className="font-medium">{selectedConv.message_count || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="font-medium">{formatDuration(selectedConv.duration)}</p>
              </div>

              {selectedConv.ai_summary && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Summary</label>
                  <p className="text-sm">{selectedConv.ai_summary}</p>
                </div>
              )}

              {selectedConv.metadata?.topics && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Topics</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedConv.metadata.topics.map((topic: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConv.messages && selectedConv.messages.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Recent Messages
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedConv.messages.slice(0, 5).map((msg) => (
                      <Card key={msg.id} className="p-2">
                        <div className="font-semibold text-sm mb-1">
                          {msg.sender === 'user' ? '👤 You' : '🤖 AI'}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {msg.content}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Select a conversation to view details
            </p>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
