// lib/api/client.ts
import { getSession } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<FullApiResponse<T>> {
    const session = await getSession();
    const token = session?.access_token;


    if (!token) {
      throw new Error('No authentication token. Please login again.');
    }

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
      'Authorization': `Bearer ${token}`,
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
        console.error(`API Error [${endpoint}]:`, error.message);
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
