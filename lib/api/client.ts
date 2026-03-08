// lib/api/client.ts
import { getSession } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
};

export type ApiError = {
  success: false;
  error: string;
  status: string;
  statusCode: number;
};

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = await getSession();
    const token = session?.access_token;

    // ✅ Fix: jangan set Content-Type kalau FormData
    // biarkan browser set sendiri dengan boundary yang benar
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> | ApiError = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(
          (data as ApiError).error || `Request failed with status ${response.status}`
        );
      }

      if ((data as ApiResponse<T>).success === false) {
        throw new Error((data as ApiResponse<T>).error || 'Unknown error');
      }

      return (data as ApiResponse<T>).data as T;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string, query?: Record<string, any>): Promise<T> {
    const queryString = query
      ? `?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
          )
        ).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    // ✅ Fix: kalau FormData, kirim langsung tanpa stringify
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();