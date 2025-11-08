'use client';

import { useEffect, useState } from 'react';
import { useIntelligence } from '@/lib/useIntelligence';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Trash2, TrendingUp, MessageSquare, Tag, Sparkles } from 'lucide-react';

export default function IntelligenceProfile() {
  const {
    intelligence,
    stats,
    loading,
    error,
    fetchIntelligence,
    analyzeAllConversations,
    resetIntelligence
  } = useIntelligence();

  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    try {
      await analyzeAllConversations();
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all learned intelligence? This cannot be undone.')) {
      try {
        await resetIntelligence();
      } catch (err) {
        console.error('Reset failed:', err);
      }
    }
  };

  if (loading && !intelligence) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2">Loading intelligence...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Intelligence Profile</h2>
              <p className="text-sm text-muted-foreground">
                Personalized learning from your conversations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAnalyzeAll}
              disabled={analyzing}
              variant="outline"
              size="sm"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze All
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total_intelligence_records}</p>
                <p className="text-xs text-muted-foreground">Intelligence Records</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.high_confidence_records}</p>
                <p className="text-xs text-muted-foreground">High Confidence</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversations_analyzed}</p>
                <p className="text-xs text-muted-foreground">Conversations Analyzed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.learning_events}</p>
                <p className="text-xs text-muted-foreground">Learning Events</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Preferences */}
      {intelligence?.preferences && Object.keys(intelligence.preferences).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Your Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(intelligence.preferences).map(([key, data]: [string, any]) => (
              <div key={key} className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                    {Math.round(data.confidence * 100)}% confident
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {typeof data.value === 'boolean' 
                    ? (data.value ? 'Yes' : 'No')
                    : JSON.stringify(data.value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Topics */}
      {intelligence?.topics?.favorite_topics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            Favorite Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {intelligence.topics.favorite_topics.value.map((topic: string) => (
              <span
                key={topic}
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Confidence: {Math.round(intelligence.topics.favorite_topics.confidence * 100)}%
          </p>
        </Card>
      )}

      {/* Communication Style */}
      {intelligence?.styles && Object.keys(intelligence.styles).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Communication Style
          </h3>
          <div className="space-y-3">
            {Object.entries(intelligence.styles).map(([key, data]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm text-muted-foreground">
                  {typeof data.value === 'number' ? `${data.value} chars` : data.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {(!intelligence || (
        Object.keys(intelligence.preferences).length === 0 &&
        Object.keys(intelligence.topics).length === 0 &&
        Object.keys(intelligence.styles).length === 0
      )) && (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Intelligence Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start chatting to help the AI learn your preferences and patterns!
          </p>
          <Button onClick={handleAnalyzeAll} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Analyze Existing Conversations'}
          </Button>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}
    </div>
  );
}
