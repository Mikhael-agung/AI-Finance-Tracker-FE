// lib/api/sync.ts
import { api } from './client';

export const syncApi = {
  // STORE GOOGLE TOKEN (DIPANGGIL DARI CALLBACK)
  storeGoogleToken: async (data: {
    google_token: string;
    google_refresh_token?: string;
    expires_in?: number;
  }) => {
    api.invalidateCsrf();
    const { data: result } = await api.post('/auth/store-gmail-token', data);
    return result;
  },

  // TRIGGER MANUAL SYNC
  triggerSync: async () => {
    api.invalidateCsrf();
    const { data } = await api.post('/sync/trigger');
    return data;
  },

  // GET SYNC STATUS
  getSyncStatus: async () => {
    const { data } = await api.get('/sync/status');
    return data;
  },

  // TEST GMAIL CONNECTION
  testConnection: async () => {
    const { data } = await api.get('/sync/test');
    return data;
  },

  // DISCONNECT GMAIL
  disconnectGmail: async () => {
    api.invalidateCsrf();
    const { data } = await api.post('/auth/disconnect-gmail');
    return data;
  },
};