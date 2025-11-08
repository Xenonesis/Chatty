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
  reactions?: Record<string, number>;
  is_bookmarked?: boolean;
  bookmarked_at?: string | null;
  parent_message?: number | null;
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

    // Handle empty responses (e.g., 204 No Content from DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  }

  // Conversation endpoints
  async getConversations(userId: string = 'default_user'): Promise<Conversation[]> {
    const response = await this.request<{ count: number; next: string | null; previous: string | null; results: Conversation[] }>(`/conversations/?user_id=${userId}`);
    // Handle paginated response from Django REST Framework
    return response.results || [];
  }

  async getConversation(id: number): Promise<Conversation> {
    return this.request<Conversation>(`/conversations/${id}/`);
  }

  async createConversation(title?: string, userId: string = 'default_user'): Promise<Conversation> {
    console.log('Creating conversation with title:', title || 'New Conversation');
    try {
      const result = await this.request<Conversation>('/conversations/', {
        method: 'POST',
        body: JSON.stringify({ 
          title: title || 'New Conversation',
          user_id: userId 
        }),
      });
      console.log('Conversation created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async generateSummary(id: number): Promise<{ conversation: Conversation; summary: string }> {
    return this.request(`/conversations/${id}/generate-summary/`, {
      method: 'POST',
    });
  }

  async endConversation(id: number): Promise<{ conversation: Conversation; summary: string }> {
    return this.request(`/conversations/${id}/end/`, {
      method: 'POST',
    });
  }

  async deleteConversation(id: number): Promise<void> {
    return this.request(`/conversations/${id}/`, {
      method: 'DELETE',
    });
  }

  // Message endpoints
  async sendMessage(conversationId: number, content: string, provider?: string, model?: string, userId: string = 'default_user'): Promise<SendMessageResponse> {
    const body: any = {
      conversation_id: conversationId,
      content,
      user_id: userId,
    };
    
    // Only include provider if it's defined and not empty
    if (provider) {
      body.provider = provider;
    }
    
    // Only include model if it's defined and not empty
    if (model) {
      body.model = model;
    }
    
    console.log('Sending message with body:', body);
    
    return this.request<SendMessageResponse>('/messages/send/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Intelligence endpoints
  async queryIntelligence(query: string, searchKeywords?: string, userId: string = 'default_user'): Promise<QueryIntelligenceResponse> {
    return this.request<QueryIntelligenceResponse>('/intelligence/query/', {
      method: 'POST',
      body: JSON.stringify({
        query,
        search_keywords: searchKeywords,
        user_id: userId,
      }),
    });
  }

  async searchConversations(query: string, semantic: boolean = false, userId: string = 'default_user'): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      semantic: semantic.toString(),
      user_id: userId,
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

  async getConfiguredProviders(): Promise<{ providers: Array<{ id: string; name: string }>; current_provider: string }> {
    return this.request('/settings/ai/providers/');
  }

  // Export endpoints
  async exportConversation(id: number, format: 'json' | 'markdown' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/conversations/${id}/export/${format}/`);
    if (!response.ok) {
      throw new Error(`Failed to export conversation: ${response.status}`);
    }
    return response.blob();
  }

  // Sharing endpoints
  async createShareLink(id: number, expiryDays: number = 7): Promise<{ share_token: string; share_url: string; expires_at: string }> {
    return this.request(`/conversations/${id}/share/`, {
      method: 'POST',
      body: JSON.stringify({ expiry_days: expiryDays }),
    });
  }

  async getSharedConversation(token: string): Promise<any> {
    return this.request(`/shared/${token}/`);
  }

  // Message actions
  async toggleBookmark(messageId: number): Promise<{ message_id: number; is_bookmarked: boolean; bookmarked_at: string | null }> {
    return this.request(`/messages/${messageId}/bookmark/`, {
      method: 'POST',
    });
  }

  async addReaction(messageId: number, reaction: string): Promise<{ message_id: number; reactions: Record<string, number> }> {
    return this.request(`/messages/${messageId}/react/`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    });
  }

  // Analytics endpoints
  async getAnalyticsTrends(days: number = 30): Promise<any> {
    return this.request(`/analytics/trends/?days=${days}`);
  }

  async getConversationStats(id: number): Promise<any> {
    return this.request(`/conversations/${id}/stats/`);
  }
}

export const api = new APIClient();
