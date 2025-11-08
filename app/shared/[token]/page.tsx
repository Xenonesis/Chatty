'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, Clock, Share2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface SharedMessage {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface SharedConversationData {
  conversation: {
    id: number;
    title: string;
    start_timestamp: string;
    end_timestamp: string | null;
    status: string;
    summary: string | null;
  };
  messages: SharedMessage[];
  share_metadata: {
    created_at: string;
    expires_at: string;
  };
}

export default function SharedConversationPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<SharedConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedConversation();
  }, [token]);

  const loadSharedConversation = async () => {
    try {
      setLoading(true);
      const result = await api.getSharedConversation(token);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to load shared conversation:', err);
      setError('This shared conversation is not available or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-zinc-950 dark:via-neutral-900 dark:to-stone-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading shared conversation...</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-zinc-950 dark:via-neutral-900 dark:to-stone-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <h2 className="text-xl font-semibold">Conversation Not Available</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { conversation, messages, share_metadata } = data;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 dark:from-zinc-950 dark:via-neutral-900 dark:to-stone-950">
      {/* Header */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Shared Conversation</h1>
              <p className="text-sm text-muted-foreground">Read-only view</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Conversation Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {conversation.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Started:</span>
                <span>{new Date(conversation.start_timestamp).toLocaleString()}</span>
              </div>
              {conversation.end_timestamp && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ended:</span>
                  <span>{new Date(conversation.end_timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                {conversation.status}
              </Badge>
              <Badge variant="outline">
                {messages.length} messages
              </Badge>
            </div>

            {conversation.summary && (
              <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {conversation.summary}
                </p>
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> This link expires on {new Date(share_metadata.expires_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={message.sender === 'user' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {message.sender === 'user' ? '👤 You' : '🤖 AI'}
                    </Badge>
                    <span className={`text-xs ${
                      message.sender === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">ChattyAI</span>
          </p>
        </div>
      </div>
    </main>
  );
}
