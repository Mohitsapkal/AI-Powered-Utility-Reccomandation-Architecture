import {
  HomeData,
  Tool,
  Workflow,
  Post,
  Comment,
  Category,
  SearchResults,
  UserProfile,
  AvatarOption,
  AppUpdateInfo,
} from '@/types';

export const API_BASE_URL = 'https://craly-backend.onrender.com';

export function getFaviconUrl(url?: string): string {
  if (!url) return '';
  try {
    const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    return `https://manifest.im/icon/${domain}`;
  } catch {
    return '';
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('craly_auth_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('craly_auth_token', token);
  } else {
    localStorage.removeItem('craly_auth_token');
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(12000) : undefined,
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || `Request failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      data: (json.data !== undefined ? json.data : json) as T,
    };
  } catch (err: any) {
    console.warn(`[Craly API] Call to ${endpoint} failed or timed out:`, err.message);
    return {
      success: false,
      message: err.message || 'Network error occurred',
    };
  }
}

/**
 * Normalizes tool data from the backend to ensure compatibility:
 * - Populated category object is flattened to a category string name
 * - Consistent id fallback from _id
 */
export function normalizeTool(tool: any): Tool {
  if (!tool) return tool;
  const categoryName =
    typeof tool.category === 'object' && tool.category !== null
      ? tool.category.name || tool.category.title || tool.category._id || 'AI Tool'
      : (tool.category || 'AI Tool');

  return {
    ...tool,
    id: tool.id || tool._id || '',
    category: categoryName,
  };
}

/* ==================== CORE API SERVICE EXPORTS (LIVE DATA ONLY) ==================== */

export const cralyApi = {
  // Home: Aggregates real backend data
  async getHomeData(): Promise<HomeData> {
    const res = await request<HomeData>('/api/home');
    if (res.success && res.data && (res.data.trendingTools?.length || res.data.topTools?.length)) {
      return {
        banners: res.data.banners || [],
        promotions: res.data.promotions || [],
        trendingTools: (res.data.trendingTools || []).map(normalizeTool),
        topTools: (res.data.topTools || []).map(normalizeTool),
        topWorkflows: res.data.topWorkflows || [],
        topCategories: res.data.topCategories || [],
        personalized: {
          tools: (res.data.personalized?.tools || []).map(normalizeTool),
          workflows: res.data.personalized?.workflows || [],
        },
      };
    }

    // When /api/home requires user auth or returns empty, fetch live database records directly
    try {
      const [tools, workflows, categories] = await Promise.all([
        cralyApi.getTools({ limit: 16 }),
        cralyApi.getWorkflows(1, 6),
        cralyApi.getCategories(1, 8),
      ]);

      const trendingTools = tools.filter((t: Tool) => t.isTrending);
      const actualTrending = trendingTools.length > 0 ? trendingTools.slice(0, 4) : tools.slice(0, 4);

      return {
        banners: [
          {
            title: 'Discover Curated AI Tools & Automated Workflows',
            subtitle: 'Benchmark capabilities, copy tested prompts, and supercharge your creative and technical output.',
            badge: 'LIVE DIRECTORY',
            linkUrl: '/tools',
            buttonText: 'Explore Directory',
          },
        ],
        promotions: [],
        trendingTools: actualTrending,
        topTools: tools.slice(0, 8),
        topWorkflows: workflows.slice(0, 4),
        topCategories: categories.slice(0, 6),
        personalized: {
          tools: tools.slice(0, 3),
          workflows: workflows.slice(0, 2),
        },
      };
    } catch {
      return {
        banners: [],
        promotions: [],
        trendingTools: [],
        topTools: [],
        topWorkflows: [],
        topCategories: [],
        personalized: { tools: [], workflows: [] },
      };
    }
  },

  // Tools
  async getTools(params?: { trending?: boolean; category?: string; page?: number; limit?: number }): Promise<Tool[]> {
    const query = new URLSearchParams();
    if (params?.trending) query.set('trending', 'true');
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await request<any>(`/api/tools?${query.toString()}`);
    if (res.success && res.data) {
      const tools = Array.isArray(res.data) ? res.data : res.data.tools || [];
      return tools.map(normalizeTool);
    }
    return [];
  },

  async getToolDetail(id: string): Promise<(Tool & { relatedTools?: Tool[] }) | null> {
    const res = await request<any>(`/api/tools/${id}`);
    if (res.success && res.data) {
      const rawTool = res.data.tool || res.data;
      const normalized = normalizeTool(rawTool);
      const related = Array.isArray(res.data.relatedTools)
        ? res.data.relatedTools.map(normalizeTool)
        : [];
      return {
        ...normalized,
        relatedTools: related,
      };
    }
    return null;
  },

  async likeTool(id: string): Promise<boolean> {
    const res = await request(`/api/tools/${id}/like`, { method: 'PATCH' });
    return res.success;
  },

  // Categories
  async getCategories(page = 1, limit = 20, sort = 'popularity'): Promise<Category[]> {
    const res = await request<any>(`/api/categories?page=${page}&limit=${limit}&sort=${sort}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.categories || [];
      return list;
    }
    return [];
  },

  async getCategoryDetail(id: string): Promise<Category | null> {
    const res = await request<any>(`/api/categories/${id}`);
    if (res.success && res.data) {
      return res.data.category || res.data;
    }
    return null;
  },

  async getCategoryTools(id: string, page = 1, limit = 12): Promise<Tool[]> {
    const res = await request<any>(`/api/categories/${id}/tools?page=${page}&limit=${limit}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.tools || [];
      return list.map(normalizeTool);
    }
    return [];
  },

  // Workflows
  async getWorkflows(page = 1, limit = 10): Promise<Workflow[]> {
    const res = await request<any>(`/api/workflows?page=${page}&limit=${limit}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.workflows || [];
      return list;
    }
    return [];
  },

  async getWorkflowDetail(id: string): Promise<Workflow | null> {
    const res = await request<any>(`/api/workflows/${id}`);
    if (res.success && res.data) {
      return res.data.workflow || res.data;
    }
    return null;
  },

  async likeWorkflow(id: string): Promise<boolean> {
    const res = await request(`/api/workflows/${id}/like`, { method: 'PATCH' });
    return res.success;
  },

  // Posts & Feed
  async getPosts(page = 1, limit = 10, postType?: string): Promise<Post[]> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (postType && postType !== 'all') query.set('postType', postType);

    const res = await request<any>(`/api/posts?${query.toString()}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.posts || [];
      return list;
    }
    return [];
  },

  async getPostDetail(id: string): Promise<Post | null> {
    const res = await request<any>(`/api/posts/${id}`);
    if (res.success && res.data) {
      return res.data.post || res.data;
    }
    return null;
  },

  async likePost(id: string): Promise<boolean> {
    const res = await request(`/api/posts/${id}/like`, { method: 'PATCH' });
    return res.success;
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const res = await request<Comment[]>(`/api/comments/post/${postId}`);
    if (res.success && res.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async addComment(data: { postId: string; content: string; parentCommentId?: string }): Promise<boolean> {
    const res = await request('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.success;
  },

  async updateComment(id: string, content: string): Promise<boolean> {
    const res = await request(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return res.success;
  },

  async deleteComment(id: string): Promise<boolean> {
    const res = await request(`/api/comments/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async likeComment(id: string): Promise<boolean> {
    const res = await request(`/api/comments/${id}/like`, {
      method: 'PATCH',
    });
    return res.success;
  },

  // Universal Search
  async search(query: string): Promise<SearchResults> {
    if (!query.trim()) {
      return { tools: [], categories: [], workflows: [], posts: [] };
    }
    const res = await request<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`);
    if (res.success && res.data) {
      return {
        tools: (res.data.tools || []).map(normalizeTool),
        categories: res.data.categories || [],
        workflows: res.data.workflows || [],
        posts: res.data.posts || [],
      };
    }
    return { tools: [], categories: [], workflows: [], posts: [] };
  },

  // User Profile & Activity
  async getUserProfile(): Promise<UserProfile | null> {
    const res = await request<UserProfile>('/api/users/profile');
    if (res.success && res.data) return res.data;
    return null;
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    const res = await request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.success;
  },

  async getLikedPosts(): Promise<Post[]> {
    const res = await request<Post[]>('/api/users/liked-posts');
    if (res.success && res.data && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getLikedTools(): Promise<Tool[]> {
    const res = await request<Tool[]>('/api/users/liked-tools');
    if (res.success && res.data && Array.isArray(res.data)) return res.data.map(normalizeTool);
    return [];
  },

  async getLikedWorkflows(): Promise<Workflow[]> {
    const res = await request<Workflow[]>('/api/users/liked-workflows');
    if (res.success && res.data && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getUserComments(): Promise<Comment[]> {
    const res = await request<Comment[]>('/api/users/comments');
    if (res.success && res.data && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getAvatars(): Promise<AvatarOption[]> {
    const res = await request<AvatarOption[]>('/api/settings/get-avatars');
    if (res.success && res.data && Array.isArray(res.data)) return res.data;
    return [];
  },

  async getAiModelConfig(): Promise<{ modelName?: string; apiKey?: string; systemInstruction?: string } | null> {
    const res = await request<any>('/api/settings/get-models');
    if (res.success && res.data && res.data[0]) {
      return res.data[0];
    }
    return null;
  },

  async getAppUpdate(): Promise<AppUpdateInfo | null> {
    const res = await request<AppUpdateInfo>('/api/settings/get-app-update');
    if (res.success && res.data) return res.data;
    return null;
  },

  // Auth
  async loginWithFirebaseIdToken(idToken: string, fcmToken?: string) {
    return request<any>('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ idToken, fcmToken: fcmToken || '' }),
    });
  },

  async loginWithGoogle(idToken: string, fcmToken?: string) {
    const res = await request<any>('/api/auth/user/google', {
      method: 'POST',
      body: JSON.stringify({ idToken, fcmToken: fcmToken || '' }),
    });
    // Fallback to login endpoint if google endpoint returns 404
    if (!res.success) {
      return this.loginWithFirebaseIdToken(idToken, fcmToken);
    }
    return res;
  },

  async signup(email: string, password: string, displayName: string) {
    return request<any>('/api/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  async updateFcmToken(fcmToken: string) {
    return request<any>('/api/auth/user/fcm-token', {
      method: 'POST',
      body: JSON.stringify({ fcmToken }),
    });
  },
};
