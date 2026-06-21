export type TransactionSource = 'email' | 'pdf_import' | 'manual';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  wallet_id: string;
  wallet_name?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  notes?: string;
  tags?: string[];
  is_recurring?: boolean;
  recurring_interval?: string;
  currency: string;
  status: 'verified' | 'pending' | 'corrected' | 'flagged' | 'recurring' | 'duplicate';
  metadata?: Record<string, any>;

  // Kolom dari Supabase yang belum ada di type lama
  source: TransactionSource;
  bank?: string;
  merchant_name?: string;
  category_id?: string;
  email_id?: string;
}