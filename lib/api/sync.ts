import { api } from './client';
import { ApiResponse, SyncStatus } from '@/types';

export const syncApi = {
  storeGoogleToken: async (data: {
    google_token: string;
    google_refresh_token?: string;
    expires_in?: number;
  }) => {
    api.invalidateCsrf();
    const { data: result } = await api.post('/auth/store-gmail-token', data);
    return result;
  },

  triggerSync: async (): Promise<ApiResponse<{ created: number }>> => {
    api.invalidateCsrf();
    const { data } = await api.post('/sync/trigger');
    return data as ApiResponse<{ created: number }>;
  },

  getSyncStatus: async (): Promise<ApiResponse<SyncStatus>> => {
    const { data } = await api.get('/sync/status');
    return data as ApiResponse<SyncStatus>;
  },

  testConnection: async () => {
    const { data } = await api.get('/sync/test');
    return data;
  },

  disconnectGmail: async () => {
    api.invalidateCsrf();
    const { data } = await api.post('/auth/disconnect-gmail');
    return data;
  },
};