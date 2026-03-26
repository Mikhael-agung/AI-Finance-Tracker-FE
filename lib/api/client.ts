// lib/api/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// const BASE_URL = "/api/proxy";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
  pagination?: PaginationMeta;
};

export type ApiError = {
  success: false;
  error: string;
  status: string;
  statusCode: number;
};

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
  page?: number;
};

export type FullApiResponse<T = any> = {
  data: T;
  pagination?: PaginationMeta;
};

const isDev = process.env.NODE_ENV === 'development';
const devLog = (...args: any[]) => isDev && console.error(...args);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
  );
}

const supabaseUrl = SUPABASE_URL as string;
const supabaseAnonKey = SUPABASE_ANON_KEY as string;

class ApiClient {

  private supabaseClient: SupabaseClient | null = null;
  private getSupabaseClient(): SupabaseClient {
    if (!this.supabaseClient) {
      this.supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    return this.supabaseClient;
  }

  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;
  private tokenPromise: Promise<string | null> | null = null;
  private readonly TOKEN_TTL = 4 * 60 * 1000;

  private async getToken(): Promise<string | null> {
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = fetch('/api/auth/token', { credentials: 'include' })
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (typeof data?.token === 'string' && data.token.length > 0) {
          this.cachedToken = data.token;
          this.tokenExpiry = Date.now() + this.TOKEN_TTL;
        }
        return this.cachedToken;
      })
      .catch(() => null)
      .finally(() => {
        this.tokenPromise = null;
      });

    return this.tokenPromise;
  }

  private csrfToken: string | null = null;
  private csrfTokenExpiry: number = 0;
  private readonly CSRF_TTL = 30 * 60 * 1000; // 30 minutes

  private async getCsrfToken(): Promise<string | null> {
    const isExpired = Date.now() > this.csrfTokenExpiry;
    if (this.csrfToken && !isExpired) return this.csrfToken;
    this.csrfToken = null;
    try {
      const res = await fetch(`${BASE_URL}/csrf-token`, { credentials: 'include' });
      if (!res.ok) {
        devLog('Error fetching CSRF token:', res.statusText);
        return null;
      }

      const data = await res.json();

      if (typeof data?.token !== 'string' || data.token.length === 0) {
        devLog('Invalid CSRF token received:', data);
        return null;
      }

      this.csrfToken = data.token;
      this.csrfTokenExpiry = Date.now() + this.CSRF_TTL;
      return this.csrfToken;
    } catch (err) {
      devLog('Error fetching CSRF token:', err);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<FullApiResponse<T>> {

    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET');
    const csrfToken = isMutating ? await this.getCsrfToken() : null;
    const isFormData = options.body instanceof FormData;
    const token = await this.getToken();
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),

    };


    const url = `${BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // CodeRabbit #1: handle 204 No Content tanpa .json()
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { data: undefined as T };
      }

      const raw: ApiResponse<T> | ApiError = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(
          (raw as ApiError).error || `Request failed with status ${response.status}`
        );
      }

      if ((raw as ApiResponse<T>).success === false) {
        throw new Error((raw as ApiResponse<T>).error || 'Unknown error');
      }

      const res = raw as ApiResponse<T>;
      return {
        data: res.data as T,
        pagination: res.pagination,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        }
        devLog(`API Error [${endpoint}]:`, error.message);
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async get<T>(endpoint: string, query?: Record<string, any>): Promise<FullApiResponse<T>> {
    const queryString = query
      ? `?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
        )
      ).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<FullApiResponse<T>> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<FullApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<FullApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<FullApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
