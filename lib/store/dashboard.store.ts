import { create } from 'zustand';
import { fetchWalletSummary } from '@/lib/api/wallets';
import { fetchRecentTransactions, fetchTransactionSummary, fetchSpendingByCategory, fetchTransactions } from '@/lib/api/transactions';
import { api } from '@/lib/api/client';
import { startOfMonth } from 'date-fns';
import type { Transaction } from '@/types/transaction.types';

const CACHE_TTL = 35 * 60 * 1000; // 35 menit

interface DashboardData {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    walletCount: number;
    totalTransactions: number;
    recentTransactions: Transaction[];
    spendingByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

interface GmailStatus {
    connected: boolean;
    is_expired: boolean;
    can_sync_now: boolean;
}

interface DashboardStore {
    data: DashboardData;
    gmailStatus: GmailStatus | null;
    lastSynced: Date | null;
    loading: boolean;
    lastFetched: number | null;

    fetchDashboard: (force?: boolean) => Promise<void>;
    setLastSynced: (date: Date) => void;
    invalidate: () => void;
}

const DEFAULT_DATA: DashboardData = {
    totalBalance: 0, totalIncome: 0, totalExpenses: 0, netFlow: 0,
    walletCount: 0, totalTransactions: 0,
    recentTransactions: [], spendingByCategory: [],
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    data: DEFAULT_DATA,
    gmailStatus: null,
    lastSynced: null,
    loading: false,
    lastFetched: null,

    fetchDashboard: async (force = false) => {
        const { lastFetched, loading } = get();
        if (loading) return;

        const isStale = !lastFetched || Date.now() - lastFetched > CACHE_TTL;
        const hasData = get().data.totalBalance !== 0 || get().data.recentTransactions.length > 0;

        if ( !force && !isStale ) return; // cache hit
        
        const showLoading = force || !hasData;
        if ( showLoading ) set({ loading: true });
        
        try {
            const [walletSummary, summary, recentTx, spending, monthlyCount] = await Promise.allSettled([
                fetchWalletSummary(),
                fetchTransactionSummary('month'),
                fetchRecentTransactions(5),
                fetchSpendingByCategory('month'),
                fetchTransactions({
                    start_date: startOfMonth(new Date()).toISOString(),
                    end_date: new Date().toISOString(),
                    limit: 1,
                }),
            ]);

            const newData: DashboardData = {
                totalBalance: walletSummary.status === 'fulfilled' ? walletSummary.value.totalBalance : 0,
                walletCount: walletSummary.status === 'fulfilled' ? walletSummary.value.walletCount : 0,
                totalIncome: summary.status === 'fulfilled' ? summary.value.totalIncome : 0,
                totalExpenses: summary.status === 'fulfilled' ? summary.value.totalExpenses : 0,
                netFlow: summary.status === 'fulfilled' ? summary.value.netFlow : 0,
                recentTransactions: recentTx.status === 'fulfilled' ? recentTx.value : [],
                spendingByCategory: spending.status === 'fulfilled' ? spending.value : [],
                totalTransactions: monthlyCount.status === 'fulfilled' ? monthlyCount.value.totalItems : 0,
            };

            let gmailStatus = null;
            try {
                const syncStatus = await api.get<any>('/sync/status');
                if (syncStatus.data?.last_sync) set({ lastSynced: new Date(syncStatus.data.last_sync) });
                gmailStatus = {
                    connected: syncStatus.data?.email_connected || false,
                    is_expired: syncStatus.data?.is_expired || false,
                    can_sync_now: syncStatus.data?.can_sync_now || false,
                };
            } catch { }

            set({ data: newData, gmailStatus, loading: false, lastFetched: Date.now() });
        } catch {
            set({ loading: false });
        }
    },

    setLastSynced: (date) => set({ lastSynced: date }),
    invalidate: () => set({ lastFetched: null }),
}));