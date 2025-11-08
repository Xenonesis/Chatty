/**
 * Hook for managing AI intelligence in local storage and syncing with backend
 */
import { useState, useEffect, useCallback } from 'react';

interface UserIntelligence {
  user_id: string;
  preferences: Record<string, any>;
  patterns: Record<string, any>;
  topics: Record<string, any>;
  styles: Record<string, any>;
  context: Record<string, any>;
  last_updated: string | null;
}

interface IntelligenceStats {
  total_intelligence_records: number;
  high_confidence_records: number;
  conversations_analyzed: number;
  learning_events: number;
}

interface BehaviorEvent {
  type: 'message_sent' | 'conversation_started' | 'conversation_ended' | 'search_performed' | 'preference_changed';
  data: any;
  timestamp: string;
}

const STORAGE_KEY = 'chatty_user_intelligence';
const BEHAVIOR_KEY = 'chatty_behavior_events';
const API_BASE = 'http://localhost:8000/api';

export function useIntelligence(userId: string = 'default_user') {
  const [intelligence, setIntelligence] = useState<UserIntelligence | null>(null);
  const [stats, setStats] = useState<IntelligenceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load intelligence from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.user_id === userId) {
          setIntelligence(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored intelligence:', e);
      }
    }
  }, [userId]);

  // Fetch intelligence from backend
  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/intelligence/user/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch intelligence');
      
      const data = await response.json();
      setIntelligence(data.profile);
      setStats(data.stats);
      
      // Store in local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Intelligence fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Track behavior event
  const trackBehavior = useCallback((type: BehaviorEvent['type'], data: any) => {
    const event: BehaviorEvent = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Store in local storage
    const stored = localStorage.getItem(BEHAVIOR_KEY);
    const events: BehaviorEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(events));
  }, []);

  // Analyze conversation
  const analyzeConversation = useCallback(async (conversationId: number) => {
    try {
      const response = await fetch(
        `${API_BASE}/intelligence/analyze/${conversationId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        }
      );
      
      if (!response.ok) throw new Error('Failed to analyze conversation');
      
      const data = await response.json();
      
      // Refresh intelligence after analysis
      await fetchIntelligence();
      
      return data;
    } catch (err) {
      console.error('Conversation analysis error:', err);
      throw err;
    }
  }, [userId, fetchIntelligence]);

  // Analyze all conversations
  const analyzeAllConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/intelligence/analyze-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) throw new Error('Failed to analyze conversations');
      
      await fetchIntelligence();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, fetchIntelligence]);

  // Get personalized context for AI
  const getPersonalizedContext = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE}/intelligence/context/?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch context');
      
      const data = await response.json();
      return data.context;
    } catch (err) {
      console.error('Context fetch error:', err);
      return '';
    }
  }, [userId]);

  // Reset intelligence
  const resetIntelligence = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/intelligence/reset/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) throw new Error('Failed to reset intelligence');
      
      // Clear local storage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BEHAVIOR_KEY);
      
      setIntelligence(null);
      setStats(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [userId]);

  // Get behavior events from local storage
  const getBehaviorEvents = useCallback((): BehaviorEvent[] => {
    const stored = localStorage.getItem(BEHAVIOR_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  return {
    intelligence,
    stats,
    loading,
    error,
    fetchIntelligence,
    trackBehavior,
    analyzeConversation,
    analyzeAllConversations,
    getPersonalizedContext,
    resetIntelligence,
    getBehaviorEvents
  };
}
