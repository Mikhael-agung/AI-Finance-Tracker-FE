'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletStore } from '@/lib/store/wallet.store';
import { createWalletSchema, type CreateWalletFormValues } from '@/lib/validation/wallet.schema';
import { WALLET_BANKS, type Wallet } from '@/types/wallet.types';
import { formatCurrency } from '@/lib/utils/formatters';
import WalletList from '@/components/wallets/WalletList';

const DEFAULT_FORM: CreateWalletFormValues = {
    name: '',
    bank: 'BCA',
    account_number: '',
    initial_balance: 0,
    currency: 'IDR',
    color: '',
    icon: '',
    is_default: false,
    sync_email: '',
    notes: '',
};

function AddWalletModal({ onClose }: { onClose: () => void }) {
    const createWallet = useWalletStore((s) => s.createWallet);
    const [form, setForm] = useState<CreateWalletFormValues>(DEFAULT_FORM);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const result = createWalletSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as string;
                if (key) fieldErrors[key] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setSubmitting(true);
        try {
            await createWallet(result.data);
            toast.success('Wallet berhasil ditambahkan');
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Gagal menambahkan wallet';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border p-6">
                    <h3 className="text-xl font-semibold text-foreground">Tambah Wallet Baru</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Tutup">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Nama Wallet
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: BCA Utama"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Bank / Provider
                        </label>
                        <select
                            value={form.bank}
                            onChange={(e) => setForm({ ...form, bank: e.target.value as CreateWalletFormValues['bank'] })}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            {WALLET_BANKS.map((bank) => (
                                <option key={bank} value={bank}>
                                    {bank}
                                </option>
                            ))}
                        </select>
                        {errors.bank && <p className="text-xs text-destructive">{errors.bank}</p>}
                        {/* TODO: BE cuma punya field `bank`, desain Stitch minta "Tipe Akun" terpisah
                            (Bank Account/E-Wallet/Investment/Cash) — belum diputuskan derive dari bank
                            atau tambah field baru di BE. Lihat WALLET_HANDOFF.md. */}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Nomor Rekening <span className="normal-case text-muted-foreground/70">(opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.account_number}
                            onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                            placeholder="1234567890"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        {errors.account_number && <p className="text-xs text-destructive">{errors.account_number}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Saldo Awal
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                                Rp
                            </span>
                            <input
                                type="number"
                                min={0}
                                value={form.initial_balance}
                                onChange={(e) => setForm({ ...form, initial_balance: Number(e.target.value) })}
                                placeholder="0"
                                className="w-full rounded-lg border border-border bg-background py-2.5 pl-12 pr-4 font-mono text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        {errors.initial_balance && <p className="text-xs text-destructive">{errors.initial_balance}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={form.is_default}
                            onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                            className="h-4 w-4 rounded border-border accent-primary"
                        />
                        Jadikan wallet utama
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 bg-muted/40 p-6">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="rounded-lg border border-border px-4 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_30%,transparent)] transition-colors hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? 'Menyimpan...' : 'Simpan Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function WalletsPage() {
    const { wallets, loading, fetchWallets } = useWalletStore();
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, [fetchWallets]);

    const totalBalance = wallets
        .filter((w) => w.is_active !== false)
        .reduce((sum, w) => sum + (w.current_balance ?? 0), 0);

    const handleCardClick = (wallet: Wallet) => {
        // Chunk 5: buka modal detail/riwayat mutasi per-wallet.
        // Placeholder dulu biar gak silent no-op.
        toast.info(`Detail ${wallet.name} — modal riwayat mutasi menyusul (chunk 5)`);
    };

    return (
        <div className="p-6 lg:p-8">
            <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dompet Saya</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_30%,transparent)] transition-colors hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Wallet
                </button>
            </header>

            <div className="relative mb-8 overflow-hidden rounded-xl border border-border bg-card p-6 lg:p-8">
                <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
                <div className="relative z-10">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Total Saldo</p>
                    <h3 className="font-mono text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                        {loading ? '···' : formatCurrency(totalBalance)}
                    </h3>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="mb-4 font-medium text-foreground">Wallet Kamu</h2>
                <WalletList wallets={wallets} loading={loading} onCardClick={handleCardClick} />
            </div>

            {showAddModal && <AddWalletModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}