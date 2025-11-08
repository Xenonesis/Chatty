'use client';

import { useState, useEffect } from 'react';
import { api, Conversation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Search, Calendar, Clock, MessageCircle, Eye, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ConversationsListProps {
  onSelectConversation: (id: number) => void;
}

export default function ConversationsList({ onSelectConversation }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const openDeleteDialog = (id: number, title: string) => {
    setConversationToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteConversation(conversationToDelete.id);
      
      // If the deleted conversation was selected, clear the selection
      if (selectedConv?.id === conversationToDelete.id) {
        setSelectedConv(null);
      }
      
      // Reload conversations
      await loadConversations();
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `"${conversationToDelete.title}" deleted successfully`
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to delete conversation. Please try again.'
      });
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
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
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-2 sm:right-4 left-2 sm:left-auto z-50 animate-slideDown max-w-sm sm:max-w-md">
          <Card className={`shadow-lg ${notification.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              )}
              <p className="font-medium text-xs sm:text-sm">{notification.message}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{conversationToDelete?.title}"</span>?
              <br />
              <br />
              This will permanently delete the conversation and all its messages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Conversation History</span>
                  <span className="sm:hidden">History</span>
                </CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  {filteredConversations?.length || 0} conversation{filteredConversations?.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <Button
                onClick={loadConversations}
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="ml-1">Refresh</span>
              </Button>
            </div>
          </CardHeader>

          {/* Search */}
          <CardContent className="p-4 sm:p-6">
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or summary..."
                className="pl-8 sm:pl-10 text-sm sm:text-base"
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
            <div className="space-y-3 sm:space-y-4">
              {Array.isArray(filteredConversations) && filteredConversations.map((conversation, index) => (
                <Card
                  key={conversation.id}
                  className="hover:border-primary transition-all cursor-pointer hover:shadow-lg animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{conversation.title}</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(conversation.start_timestamp).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(conversation.start_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {conversation.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 bg-muted/50 rounded-lg p-2 sm:p-3">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <strong>{conversation.message_count || 0}</strong> messages
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDuration(conversation.duration)}
                    </span>
                  </div>

                  {conversation.ai_summary && (
                    <p className="text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 italic bg-primary/5 p-2 sm:p-3 rounded-lg border-l-4 border-primary">
                      "{conversation.ai_summary}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Button
                      onClick={() => onSelectConversation(conversation.id)}
                      className="flex-1 min-w-[120px]"
                      variant="default"
                      size="sm"
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="ml-1 text-xs sm:text-sm">Continue</span>
                    </Button>
                    <Button
                      onClick={() => viewConversationDetails(conversation.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">Details</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(conversation.id, conversation.title);
                      }}
                      variant="outline"
                      size="sm"
                      className="hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <Card className="sticky top-20 sm:top-24 lg:top-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Conversation Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
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
    </>
  );
}
