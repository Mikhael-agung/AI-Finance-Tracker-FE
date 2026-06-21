import { create } from 'zustand';
import { api } from '@/lib/api/client';
import {
    fetchTransactions,
    fetchTransactionSummary,
} from '@/lib/api/transactions';
import type { Transaction } from '@/types/transaction.types';
import type { TransactionFilters } from '@/types/api.types';

interface WalletOption {
    id: string;
    name: string;
}

interface PaginationState {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

interface SummaryState {
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
}

interface TransactionStoreState {
    transactions: Transaction[];
    summary: SummaryState;
    pagination: PaginationState;
    wallets: WalletOption[];

    loading: boolean;
    summaryLoading: boolean;
    walletsLoading: boolean;
    error: string | null;

    fetchTransactions: (filters: TransactionFilters) => Promise<void>;
    fetchSummary: (period?: 'week' | 'month' | 'year') => Promise<void>;
    fetchWallets: () => Promise<void>;
}

const initialPagination: PaginationState = {
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
};

const initialSummary: SummaryState = {
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
};

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
    transactions: [],
    summary: initialSummary,
    pagination: initialPagination,
    wallets: [],

    loading: false,
    summaryLoading: false,
    walletsLoading: false,
    error: null,

    fetchTransactions: async (filters) => {
        set({ loading: true, error: null });
        try {
            const result = await fetchTransactions(filters);
            set({
                transactions: result.transactions,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                },
                loading: false,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat transaksi';
            set({ error: message, loading: false });
        }
    },

    fetchSummary: async (period = 'month') => {
        set({ summaryLoading: true });
        try {
            const summary = await fetchTransactionSummary(period);
            set({
                summary: {
                    totalIncome: summary.totalIncome,
                    totalExpenses: summary.totalExpenses,
                    netFlow: summary.netFlow,
                },
                summaryLoading: false,
            });
        } catch (err) {
            // Summary gagal gak boleh nge-block tampilan table, jadi cuma log + diam-diam selesai
            set({ summaryLoading: false });
        }
    },

    fetchWallets: async () => {
        if (get().wallets.length > 0) return; // sudah pernah di-fetch, gak perlu ulang
        set({ walletsLoading: true });
        try {
            const { data } = await api.get<WalletOption[]>('/wallets');
            set({ wallets: Array.isArray(data) ? data : [], walletsLoading: false });
        } catch (err) {
            set({ walletsLoading: false });
        }
    },
}));