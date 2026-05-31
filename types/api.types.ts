import { Transaction } from './transaction.types';
import { Wallet } from './wallet.types';
import { Budget } from './budget.types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  user: UserProfile;
  access_token: string;
  expires_at: number;
}

// Dashboard Types
export interface DashboardOverview {
  total_balance: number;
  total_income: number;
  total_expenses: number;
  net_flow: number;
  wallet_count: number;
  recent_transactions: Transaction[];
  top_categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthly_summary: {
    income: number;
    expenses: number;
    savings: number;
  };
}

export interface QuickStats {
  average_monthly_spending: number;
  largest_expense: number;
  income_growth: number;
  expense_growth: number;
  saving_rate: number;
}

// Sync Types
export interface SyncStatus {
  is_syncing: boolean;
  last_sync: string | null;
  next_sync: string | null;
  email_connected: boolean;
  sync_count: number;
  gmail?: {
    email: string;
    connected: boolean;
  }
}

export interface SyncHistoryItem {
  id: string;
  status: 'success' | 'failed' | 'in_progress';
  type: 'manual' | 'automatic';
  transactions_added: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Filter Types
export interface TransactionFilters {
  wallet_id?: string;
  type?: 'income' | 'expense' | 'transfer';
  category?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DashboardFilters {
  period?: 'day' | 'week' | 'month' | 'year';
  report_type?: 'monthly' | 'quarterly' | 'yearly';
  year?: number;
  month?: number;
}