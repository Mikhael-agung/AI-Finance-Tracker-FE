// Base endpoints
const ENDPOINTS = {
  // Auth
  AUTH: {
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    SESSION: '/auth/session',
    PREFERENCES: '/auth/preferences',
    REFRESH: '/auth/refresh',
  },

  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    REPORTS: '/dashboard/reports',
    CATEGORY_ANALYSIS: '/dashboard/category-analysis',
    SPENDING_TRENDS: '/dashboard/spending-trends',
    QUICK_STATS: '/dashboard/quick-stats',
    MONTHLY_SUMMARY: (year: number, month: number) => 
      `/dashboard/monthly-summary/${year}/${month}`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: string) => `/transactions/${id}`,
    BULK_IMPORT: '/transactions/bulk-import',
    EXPORT: '/transactions/export/data',
    CATEGORIZE: (id: string) => `/transactions/${id}/categorize`,
  },

  // Wallets
  WALLETS: {
    BASE: '/wallets',
    BY_ID: (id: string) => `/wallets/${id}`,
    STATS: '/wallets/stats',
    SET_DEFAULT: (id: string) => `/wallets/${id}/set-default`,
    TRANSACTIONS: (id: string) => `/wallets/${id}/transactions`,
    SYNC: (id: string) => `/wallets/${id}/sync`,
  },

  // Budgets
  BUDGETS: {
    BASE: '/budgets',
    BY_ID: (id: string) => `/budgets/${id}`,
    SUMMARY: '/budgets/summary',
  },

  // Sync
  SYNC: {
    TRIGGER: '/sync/trigger',
    STATUS: '/sync/status',
    PREFERENCES: '/sync/preferences',
    CONNECT_EMAIL: '/sync/connect-email',
    DISCONNECT_EMAIL: '/sync/disconnect-email',
    HISTORY: '/sync/history',
  },
} as const;

export default ENDPOINTS;