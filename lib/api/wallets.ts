// lib/api/wallets.ts
import { api } from './client';

export interface Wallet {
  id: string;
  name: string;
  bank: string;
  balance: number;
  current_balance: number;
  initial_balance: number;
  currency: string;
  last_synced?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletSummary {
  totalBalance: number;
  walletCount: number;
  wallets: Wallet[];
}

export async function fetchWallets(): Promise<Wallet[]> {
  const raw = await api.get<any>('/wallets');
  return Array.isArray(raw) ? raw : (raw?.data ?? []);
}

export async function fetchWalletSummary(): Promise<WalletSummary> {
  const wallets = await fetchWallets();
  const activeWallets = wallets.filter((w) => w.is_active !== false);
  const totalBalance = activeWallets.reduce(
    (sum, w) => sum + (w.current_balance ?? w.balance ?? w.initial_balance ?? 0),
    0
  );
  return {
    totalBalance,
    walletCount: activeWallets.length,
    wallets: activeWallets,
  };
}

export async function fetchWalletById(id: string): Promise<Wallet> {
  const { data } = await api.get<Wallet>(`/wallets/${id}`);
  return data;
}

export async function createWallet(payload: Partial<Wallet>): Promise<Wallet> {
  const { data } = await api.post<Wallet>('/wallets', payload);
  return data;
}

export async function updateWallet(id: string, payload: Partial<Wallet>): Promise<Wallet> {
  const { data } = await api.put<Wallet>(`/wallets/${id}`, payload);
  return data;
}

export async function deleteWallet(id: string): Promise<void> {
  await api.delete(`/wallets/${id}`);
}