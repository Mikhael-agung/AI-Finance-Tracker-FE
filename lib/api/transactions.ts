import { api } from "./client";
import { Transaction, TransactionFilters } from "@/types/transaction.types";

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  period: string;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export async function fetchTransactions(
  filters?: TransactionFilters,
): Promise<TransactionListResponse> {
  const query: Record<string, any> = {};
  if (filters?.wallet_id) query.wallet_id = filters.wallet_id;
  if (filters?.type) query.type = filters.type;
  if (filters?.category) query.category = filters.category;
  if (filters?.start_date) query.start_date = filters.start_date;
  if (filters?.end_date) query.end_date = filters.end_date;
  if (filters?.min_amount) query.min_amount = filters.min_amount;
  if (filters?.max_amount) query.max_amount = filters.max_amount;
  if (filters?.search) query.search = filters.search;
  if (filters?.page) query.page = filters.page;
  if (filters?.limit) query.limit = filters.limit;
  if (filters?.sort_by) query.sort_by = filters.sort_by;
  if (filters?.sort_order) query.sort_order = filters.sort_order;

  // BE returns { success, data: [...], pagination: {...} }
  // api.get sudah unwrap ke .data, jadi raw = array of transactions + pagination terpisah
  const raw = await api.get<any>("/transactions", query);

  return {
    transactions: raw?.data ?? [],
    total: raw?.pagination?.totalItems ?? 0,
    totalItems: raw?.pagination?.totalItems ?? 0,
    page: raw?.pagination?.currentPage ?? 1,
    limit: raw?.pagination?.limit ?? 50,
    totalPages: raw?.pagination?.totalPages ?? 1,
  }
}

export async function fetchRecentTransactions(
  limit = 5,
): Promise<Transaction[]> {
  const result = await fetchTransactions({
    limit,
    sort_by: "transaction_date",
    sort_order: "desc",
  });
  return result.transactions ?? [];
}

export async function fetchTransactionSummary(
  period: "week" | "month" | "year" = "month",
): Promise<TransactionSummary> {
  // BE returns: { period, date_range, income, expense, net_flow }
  const raw = await api.get<any>("/transactions/summary", { period });

  return {
    totalIncome: raw?.income ?? 0,
    totalExpenses: raw?.expense ?? 0,
    netFlow: raw?.net_flow ?? 0,
    period,
  };
}

export async function fetchSpendingByCategory(
  period: "week" | "month" | "year" = "month",
): Promise<SpendingByCategory[]> {
  // BE returns: { period, total_expense, breakdown: [{category_name, total, percentage}] }
  const raw = await api.get<any>("/transactions/spending-by-category", {
    period,
  });

  const breakdown: any[] = raw?.breakdown ?? [];

  return breakdown.map((item) => ({
    category: item.category_name ?? "Lainnya",
    amount: item.total ?? 0,
    percentage: item.percentage ?? 0,
  }));
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  return api.get<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(
  data: Partial<Transaction>,
): Promise<Transaction> {
  return api.post<Transaction>("/transactions", data);
}

export async function updateTransaction(
  id: string,
  data: Partial<Transaction>,
): Promise<Transaction> {
  return api.put<Transaction>(`/transactions/${id}`, data);
}

export async function deleteTransaction(id: string): Promise<void> {
  return api.delete(`/transactions/${id}`);
}
