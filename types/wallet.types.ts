export type WalletBank =
  | 'BCA'
  | 'Mandiri'
  | 'BRI'
  | 'BNI'
  | 'CIMB'
  | 'OVO'
  | 'GoPay'
  | 'Dana'
  | 'Cash'
  | 'Other';

export const WALLET_BANKS: WalletBank[] = [
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'CIMB',
  'OVO',
  'GoPay',
  'Dana',
  'Cash',
  'Other',
];

export interface Wallet {
  id: string;
  name: string;
  bank: WalletBank;
  account_number?: string;
  current_balance: number;
  initial_balance: number;
  currency: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  is_default: boolean;
  last_synced?: string | null;
  sync_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  merchant_name?: string;
  transaction_date: string;
  status: string;
  category_id?: string;
  created_at: string;
}

export interface WalletDetail extends Wallet {
    recent_transactions: WalletTransaction[];
    transaction_count: number;
}

export interface WalletPeriodStats {
  id: string;
  name: string;
  bank: WalletBank;
  color?: string;
  initial_balance: number;
  current_balance: number;
  period_stats: {
    income: number;
    expense: number;
    net_flow: number;
  };
}

export interface WalletStatsResponse {
  period: 'week' | 'month' | 'year';
  date_range: { start: string; end: string };
  wallets: WalletPeriodStats[];
  totals: {
    total_income: number;
    total_expense: number;
    total_balance: number;
  };
}

// Payload buat create/update — initial_balance cuma relevan saat create,
// current_balance gak pernah dikirim manual (itu tanggung jawab trigger DB / endpoint /balance khusus)
export interface WalletFormPayload {
  name: string;
  bank: WalletBank;
  account_number?: string;
  initial_balance?: number;
  currency?: string;
  color?: string;
  icon?: string;
  is_default?: boolean;
  sync_email?: string;
  notes?: string;
}

export type WalletUpdatePayload = Partial<WalletFormPayload> & {
  is_active?: boolean;
};

/** Payload buat PATCH /wallets/:id/balance (manual balance adjustment). */
export interface WalletBalancePayload {
  balance: number;
  notes?: string;
}

/** Response GET /wallets/:id/transactions (paginated). */
export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}