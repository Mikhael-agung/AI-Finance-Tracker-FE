import { create } from 'zustand';
import {
    fetchWallets as fetchWalletsAPI,
    fetchWalletById as fetchWalletByIdAPI,
    createWallet as createWalletAPI,
    updateWallet as updateWalletAPI,
    deleteWallet as deleteWalletAPI,
    setDefaultWallet as setDefaultWalletAPI,
    updateWalletBalance as updateWalletBalanceAPI,
    syncWallet as syncWalletAPI,
    recalculateWalletBalance as recalculateWalletBalanceAPI,
} from '@/lib/api/wallets';
import type {
    Wallet,
    WalletDetail,
    WalletFormPayload,
    WalletUpdatePayload,
} from '@/types/wallet.types';

interface WalletStoreState {
    wallets: Wallet[];
    selectedWallet: WalletDetail | null;

    loading: boolean;
    selectedLoading: boolean;
    mutating: boolean;
    error: string | null;

    fetchWallets: (includeInactive?: boolean) => Promise<void>;
    fetchWalletById: (id: string) => Promise<void>;
    createWallet: (payload: WalletFormPayload) => Promise<Wallet>;
    updateWallet: (id: string, payload: WalletUpdatePayload) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    setDefaultWallet: (id: string) => Promise<void>;
    updateWalletBalance: (id: string, balance: number, notes?: string) => Promise<void>;
    syncWallet: (id: string) => Promise<void>;
    recalculateWalletBalance: (id: string) => Promise<void>;
}

export const useWalletStore = create<WalletStoreState>((set, get) => ({
    wallets: [],
    selectedWallet: null,

    loading: false,
    selectedLoading: false,
    mutating: false,
    error: null,

    fetchWallets: async (includeInactive = false) => {
        set({ loading: true, error: null });
        try {
            const wallets = await fetchWalletsAPI({ includeInactive });
            set({ wallets, loading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat dompet';
            set({ error: message, loading: false });
        }
    },

    fetchWalletById: async (id) => {
        set({ selectedLoading: true, error: null });
        try {
            const wallet = await fetchWalletByIdAPI(id);
            set({ selectedWallet: wallet, selectedLoading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal memuat detail dompet';
            set({ error: message, selectedLoading: false });
        }
    },

    createWallet: async (payload) => {
        set({ mutating: true, error: null });
        try {
            const wallet = await createWalletAPI(payload);
            set((state) => ({ wallets: [wallet, ...state.wallets], mutating: false }));
            return wallet;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal membuat dompet';
            set({ error: message, mutating: false });
            throw err;
        }
    },

    updateWallet: async (id, payload) => {
        // Optimistic update: langsung apply ke state, rollback kalau gagal
        const previousWallets = get().wallets;
        const previousSelected = get().selectedWallet;
        set({
            wallets: previousWallets.map((w) => (w.id === id ? { ...w, ...payload } as Wallet : w)),
            selectedWallet:
                previousSelected?.id === id ? ({ ...previousSelected, ...payload } as WalletDetail) : previousSelected,
        });

        try {
            const updated = await updateWalletAPI(id, payload);
            set((state) => ({
                wallets: state.wallets.map((w) => (w.id === id ? updated : w)),
                selectedWallet:
                    state.selectedWallet?.id === id
                        ? ({ ...state.selectedWallet, ...updated } as WalletDetail)
                        : state.selectedWallet,
            }));
        } catch (err) {
            set({ wallets: previousWallets, selectedWallet: previousSelected });
            const message = err instanceof Error ? err.message : 'Gagal memperbarui dompet';
            set({ error: message });
            throw err;
        }
    },

    deleteWallet: async (id) => {
        // Optimistic remove: langsung hapus dari state, rollback kalau gagal
        // (mis. BE nolak karena wallet masih punya transaksi)
        const previousWallets = get().wallets;
        set({ wallets: previousWallets.filter((w) => w.id !== id) });

        try {
            await deleteWalletAPI(id);
        } catch (err) {
            set({ wallets: previousWallets });
            const message = err instanceof Error ? err.message : 'Gagal menghapus dompet';
            set({ error: message });
            throw err;
        }
    },

    setDefaultWallet: async (id) => {
        const previousWallets = get().wallets;
        set({
            wallets: previousWallets.map((w) => ({ ...w, is_default: w.id === id })),
        });

        try {
            const updated = await setDefaultWalletAPI(id);
            set((state) => ({
                wallets: state.wallets.map((w) => (w.id === id ? updated : w)),
            }));
        } catch (err) {
            set({ wallets: previousWallets });
            const message = err instanceof Error ? err.message : 'Gagal mengatur dompet utama';
            set({ error: message });
            throw err;
        }
    },

    updateWalletBalance: async (id, balance, notes) => {
        // PENTING: response endpoint /balance (new_balance) adalah nilai kalkulasi
        // dari request, BUKAN hasil re-fetch DB setelah trigger `trg_transactions_balance`
        // jalan (endpoint ini insert transaksi adjustment, current_balance final
        // ditentukan trigger). Ada race condition kecil kalau langsung dipercaya.
        // Karena itu di sini kita re-fetch detail wallet dari server, bukan pakai
        // `new_balance` dari response secara langsung.
        set({ mutating: true, error: null });
        try {
            await updateWalletBalanceAPI(id, { balance, notes });
            const fresh = await fetchWalletByIdAPI(id);
            set((state) => ({
                wallets: state.wallets.map((w) =>
                    w.id === id ? { ...w, current_balance: fresh.current_balance } : w
                ),
                selectedWallet: state.selectedWallet?.id === id ? fresh : state.selectedWallet,
                mutating: false,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menyesuaikan saldo dompet';
            set({ error: message, mutating: false });
            throw err;
        }
    },

    syncWallet: async (id) => {
        set({ mutating: true, error: null });
        try {
            const result = await syncWalletAPI(id);
            set((state) => ({
                wallets: state.wallets.map((w) =>
                    w.id === id ? { ...w, last_synced: result.last_synced } : w
                ),
                mutating: false,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal sinkronisasi dompet';
            set({ error: message, mutating: false });
            throw err;
        }
    },

    recalculateWalletBalance: async (id) => {
        // Sama kayak updateWalletBalance: re-fetch daripada percaya response mentah,
        // buat menghindari race condition dengan trigger DB.
        set({ mutating: true, error: null });
        try {
            await recalculateWalletBalanceAPI(id);
            const fresh = await fetchWalletByIdAPI(id);
            set((state) => ({
                wallets: state.wallets.map((w) =>
                    w.id === id ? { ...w, current_balance: fresh.current_balance } : w
                ),
                selectedWallet: state.selectedWallet?.id === id ? fresh : state.selectedWallet,
                mutating: false,
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menghitung ulang saldo dompet';
            set({ error: message, mutating: false });
            throw err;
        }
    },
}));