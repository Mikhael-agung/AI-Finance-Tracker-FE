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
  status: 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, any>;
}