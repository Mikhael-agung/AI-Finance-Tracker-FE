// lib/api/wallets.ts
import { api } from './client';
import type {
  Wallet,
  WalletDetail,
  WalletStatsResponse,
  WalletTransactionsResponse,
  WalletFormPayload,
  WalletUpdatePayload,
  WalletBalancePayload,
} from '@/types/wallet.types';

// Re-export biar file lama yang masih import Wallet dari sini (bukan dari
// types/wallet.types.ts) tetap jalan tanpa breaking — mis. ImportPDFModal.tsx.
export type { Wallet } from '@/types/wallet.types';

export interface WalletSummary {
  totalBalance: number;
  walletCount: number;
  wallets: Wallet[];
}

export interface FetchWalletsOptions {
  includeInactive?: boolean;
}

export async function fetchWallets(options?: FetchWalletsOptions): Promise<Wallet[]> {
  const { data } = await api.get<Wallet[]>('/wallets', {
    include_inactive: options?.includeInactive ?? undefined,
  });
  return data ?? [];
}

export async function fetchWalletSummary(): Promise<WalletSummary> {
  const wallets = await fetchWallets();
  const activeWallets = wallets.filter((w) => w.is_active !== false);
  const totalBalance = activeWallets.reduce(
    (sum, w) => sum + (w.current_balance ?? w.initial_balance ?? 0),
    0
  );
  return {
    totalBalance,
    walletCount: activeWallets.length,
    wallets: activeWallets,
  };
}

export async function fetchWalletById(id: string): Promise<WalletDetail> {
  const { data } = await api.get<WalletDetail>(`/wallets/${id}`);
  return data;
}

export async function fetchWalletStats(
  period: 'week' | 'month' | 'year' = 'month'
): Promise<WalletStatsResponse> {
  const { data } = await api.get<WalletStatsResponse>('/wallets/stats', { period });
  return data;
}

export async function fetchWalletTransactions(
  id: string,
  params?: { page?: number; limit?: number }
): Promise<WalletTransactionsResponse> {
  const { data, pagination } = await api.get<WalletTransactionsResponse['data']>(
    `/wallets/${id}/transactions`,
    { page: params?.page, limit: params?.limit }
  );
  return {
    data: data ?? [],
    pagination: pagination as unknown as WalletTransactionsResponse['pagination'],
  };
}

export async function createWallet(payload: WalletFormPayload): Promise<Wallet> {
  const { data } = await api.post<Wallet>('/wallets', payload);
  return data;
}

export async function updateWallet(id: string, payload: WalletUpdatePayload): Promise<Wallet> {
  const { data } = await api.put<Wallet>(`/wallets/${id}`, payload);
  return data;
}

export async function deleteWallet(id: string): Promise<void> {
  await api.delete(`/wallets/${id}`);
}

export async function setDefaultWallet(id: string): Promise<Wallet> {
  const { data } = await api.patch<Wallet>(`/wallets/${id}/set-default`);
  return data;
}

export async function updateWalletBalance(
  id: string,
  payload: WalletBalancePayload
): Promise<{ old_balance: number; new_balance: number; adjustment: number }> {
  const { data } = await api.patch<{
    old_balance: number;
    new_balance: number;
    adjustment: number;
  }>(`/wallets/${id}/balance`, payload);
  return data;
}

export async function syncWallet(id: string): Promise<{ wallet_id: string; last_synced: string }> {
  const { data } = await api.post<{ wallet_id: string; last_synced: string }>(
    `/wallets/${id}/sync`
  );
  return data;
}

export async function recalculateWalletBalance(
  id: string
): Promise<{ wallet_id: string; old_balance: number; new_balance: number; difference: number }> {
  const { data } = await api.post<{
    wallet_id: string;
    old_balance: number;
    new_balance: number;
    difference: number;
  }>(`/wallets/${id}/recalculate`);
  return data;
}