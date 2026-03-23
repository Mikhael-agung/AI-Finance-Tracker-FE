// lib/api/sync.ts
import { createBrowserClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function getAuthHeader() {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export const syncApi = {
  // STORE GOOGLE TOKEN (DIPANGGIL DARI CALLBACK)
  storeGoogleToken: async (data: {
    google_token: string;
    google_refresh_token?: string;
    expires_in?: number;
  }) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/auth/store-gmail-token`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to store Gmail token");
    }

    return response.json();
  },

  // TRIGGER MANUAL SYNC
  triggerSync: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/sync/trigger`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sync failed");
    }

    return response.json();
  },

  // GET SYNC STATUS
  getSyncStatus: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/sync/status`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sync status");
    }

    return response.json();
  },

  // TEST GMAIL CONNECTION
  testConnection: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/sync/test`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Connection test failed");
    }

    return response.json();
  },

  // DISCONNECT GMAIL
  disconnectGmail: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_URL}/auth/disconnect-gmail`, {
      method: "POST",
      headers,
    });

    return response.json();
  },
};
