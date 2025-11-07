/**
 * API client for backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Message {
  id: number;
  conversation: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface Conversation {
  id: number;
  title: string;
  start_timestamp: string;
  end_timestamp: string | null;
  status: 'active' | 'ended';
  ai_summary?: string;
  metadata: Record<string, any>;
  message_count?: number;
  duration?: number;
  messages?: Message[];
}

export interface SendMessageResponse {
  user_message: Message;
  ai_message: Message;
}

export interface QueryIntelligenceResponse {
  answer: string;
  relevant_conversations: Conversation[];
}

export interface SearchResponse {
  results: Conversation[];
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Conversation endpoints
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/conversations/');
  }

  async getConversation(id: number): Promise<Conversation> {
    return this.request<Conversation>(`/conversations/${id}/`);
  }

  async createConversation(title?: string): Promise<Conversation> {
    return this.request<Conversation>('/conversations/', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Conversation' }),
    });
  }

  async endConversation(id: number): Promise<{ conversation: Conversation; summary: string }> {
    return this.request(`/conversations/${id}/end/`, {
      method: 'POST',
    });
  }

  // Message endpoints
  async sendMessage(conversationId: number, content: string): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>('/messages/send/', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        content,
      }),
    });
  }

  // Intelligence endpoints
  async queryIntelligence(query: string, searchKeywords?: string): Promise<QueryIntelligenceResponse> {
    return this.request<QueryIntelligenceResponse>('/intelligence/query/', {
      method: 'POST',
      body: JSON.stringify({
        query,
        search_keywords: searchKeywords,
      }),
    });
  }

  async searchConversations(query: string, semantic: boolean = false): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      semantic: semantic.toString(),
    });
    return this.request<SearchResponse>(`/conversations/search/?${params}`);
  }

  // AI Settings endpoints
  async getAISettings(): Promise<any> {
    return this.request('/settings/ai/');
  }

  async updateAISettings(provider: string, settings: Record<string, string>): Promise<any> {
    return this.request('/settings/ai/', {
      method: 'POST',
      body: JSON.stringify({ provider, settings }),
    });
  }
}

export const api = new APIClient();
