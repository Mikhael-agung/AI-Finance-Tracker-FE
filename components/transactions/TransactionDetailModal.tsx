'use client';

import { useState } from 'react';
import { X, TrendingUp, TrendingDown, ArrowLeftRight, Pencil, Trash2, Save, Ban } from 'lucide-react';
import type { Transaction } from '@/types/transaction.types';
import { formatCurrency } from '@/lib/utils/formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionDetailModalProps {
    transaction: Transaction;
    onClose: () => void;
    onDelete?: (id: string) => void;
    onSave?: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
    email: 'Gmail',
    pdf_import: 'PDF',
    manual: 'Manual',
};

const SOURCE_BADGE: Record<string, string> = {
    email: 'bg-destructive/10 text-destructive border border-destructive/20',
    pdf_import: 'bg-[oklch(0.75_0.18_60_/_0.1)] text-[oklch(0.55_0.18_60)] border border-[oklch(0.75_0.18_60_/_0.2)] dark:text-[oklch(0.78_0.18_60)]',
    manual: 'bg-muted text-muted-foreground border border-border',
};

const STATUS_BADGE: Record<string, string> = {
    verified: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    pending: 'bg-yellow-500/10  text-yellow-500  border border-yellow-500/20',
    corrected: 'bg-primary/10     text-primary     border border-primary/20',
    flagged: 'bg-destructive/10 text-destructive  border border-destructive/20',
    recurring: 'bg-purple-500/10  text-purple-500  border border-purple-500/20',
    duplicate: 'bg-muted          text-muted-foreground border border-border',
};

const STATUS_LABELS: Record<string, string> = {
    verified: 'Terverifikasi',
    pending: 'Menunggu',
    corrected: 'Dikoreksi',
    flagged: 'Ditandai',
    recurring: 'Berulang',
    duplicate: 'Duplikat',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
}

function TypeIcon({ type }: { type: Transaction['type'] }) {
    if (type === 'income') return <TrendingUp className="h-7 w-7 text-emerald-500" />;
    if (type === 'expense') return <TrendingDown className="h-7 w-7 text-destructive" />;
    return <ArrowLeftRight className="h-7 w-7 text-primary" />;
}

function TypeIconBg({ type }: { type: Transaction['type'] }) {
    if (type === 'income') return 'bg-emerald-500/10';
    if (type === 'expense') return 'bg-destructive/10';
    return 'bg-primary/10';
}

function amountColor(type: Transaction['type']) {
    if (type === 'income') return 'text-emerald-500';
    if (type === 'expense') return 'text-destructive';
    return 'text-foreground';
}

function amountPrefix(type: Transaction['type']) {
    if (type === 'income') return '+';
    if (type === 'expense') return '-';
    return '';
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <div className="text-sm font-medium text-foreground">{children}</div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// View Mode
// ---------------------------------------------------------------------------

function ViewMode({
    transaction,
    onEdit,
    onClose,
    onDelete,
}: {
    transaction: Transaction;
    onEdit: () => void;
    onClose: () => void;
    onDelete?: (id: string) => void;
}) {
    return (
        <>
            {/* Header */}
            <div className="relative bg-muted/20 pt-10 pb-8 px-6 flex flex-col items-center border-b border-border">
                <button
                    onClick={onClose} aria-label="Tutup"
                    className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className={`h-14 w-14 rounded-full ${TypeIconBg({ type: transaction.type })} flex items-center justify-center mb-4`}>
                    <TypeIcon type={transaction.type} />
                </div>

                <h3 className={`text-3xl font-bold tracking-tight mb-1 ${amountColor(transaction.type)}`}>
                    {amountPrefix(transaction.type)}{formatCurrency(transaction.amount, transaction.currency)}
                </h3>

                <p className="text-sm text-muted-foreground font-medium text-center max-w-[260px] leading-snug">
                    {transaction.description}
                </p>

                <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                    {/* Source badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${SOURCE_BADGE[transaction.source] ?? SOURCE_BADGE.manual}`}>
                        {SOURCE_LABELS[transaction.source] ?? transaction.source}
                    </span>

                    {/* Status badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_BADGE[transaction.status] ?? ''}`}>
                        {STATUS_LABELS[transaction.status] ?? transaction.status}
                    </span>

                    {/* Category pill jika ada */}
                    {transaction.category && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-secondary text-secondary-foreground">
                            {transaction.category}
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Detail Pembayaran */}
                <div className="bg-muted/20 rounded-2xl p-5 border border-border space-y-4">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detail Pembayaran</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Tanggal">
                            {formatDate(transaction.transaction_date)}
                        </DetailRow>
                        <DetailRow label="Tipe">
                            <span className={amountColor(transaction.type)}>
                                {transaction.type === 'income' ? 'Pemasukan' : transaction.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                            </span>
                        </DetailRow>
                        <DetailRow label="Bank">
                            {transaction.bank ?? <span className="text-muted-foreground">—</span>}
                        </DetailRow>
                        <DetailRow label="Metode Bayar">
                            {transaction.payment_method ?? <span className="text-muted-foreground">—</span>}
                        </DetailRow>
                        <DetailRow label="Merchant">
                            {transaction.merchant_name ?? <span className="text-muted-foreground">—</span>}
                        </DetailRow>
                        <DetailRow label="Dompet">
                            {transaction.wallet_name ?? <span className="text-muted-foreground">—</span>}
                        </DetailRow>
                    </div>

                    {/* Notes — full width, hanya tampil jika ada */}
                    {transaction.notes && (
                        <div className="pt-4 border-t border-border">
                            <DetailRow label="Catatan">
                                <p className="text-sm text-muted-foreground italic leading-relaxed">{transaction.notes}</p>
                            </DetailRow>
                        </div>
                    )}
                </div>

                {/* Informasi Tambahan */}
                <div className="bg-muted/20 rounded-2xl p-5 border border-border space-y-4">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Informasi Tambahan</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="ID Transaksi">
                            <span className="font-mono text-xs break-all">{transaction.id}</span>
                        </DetailRow>
                        <DetailRow label="Dibuat">
                            {formatDate(transaction.created_at)}
                        </DetailRow>
                        {transaction.email_id && (
                            <DetailRow label="Email ID">
                                <span className="font-mono text-xs break-all">{transaction.email_id}</span>
                            </DetailRow>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-card">
                <div className="flex gap-3">
                    <button
                        onClick={() => onDelete?.(transaction.id)}
                        className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl border border-destructive/40 text-destructive font-semibold text-sm hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                    </button>
                    <button
                        onClick={onEdit}
                        className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-[0_0_15px_oklch(0.55_0.22_240_/_0.25)]"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit
                    </button>
                </div>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Edit Mode
// ---------------------------------------------------------------------------

function EditMode({
    transaction,
    onCancel,
    onSave,
}: {
    transaction: Transaction;
    onCancel: () => void;
    onSave?: (id: string, updates: Partial<Transaction>) => Promise<void>;
}) {
    const [form, setForm] = useState({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category ?? '',
        payment_method: transaction.payment_method ?? '',
        notes: transaction.notes ?? '',
        transaction_date: transaction.transaction_date.slice(0, 16), // datetime-local format
    });
    const [saving, setSaving] = useState(false);

    const set = (key: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleSave = async () => {
        if (!onSave) return;
        setSaving(true);
        try {
            await onSave(transaction.id, {
                description: form.description,
                amount: Number(form.amount),
                type: form.type as Transaction['type'],
                category: form.category || undefined,
                payment_method: form.payment_method || undefined,
                notes: form.notes || undefined,
                transaction_date: new Date(form.transaction_date).toISOString(),
            });
            onCancel(); // tutup edit mode setelah save
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-muted/30 border border-border rounded-xl py-2.5 px-3 text-foreground text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-muted-foreground";
    const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block";

    return (
        <>
            {/* Header */}
            <div className="relative bg-muted/20 pt-8 pb-6 px-6 flex flex-col items-center border-b border-border">
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Tutup"
                >
                    <X className="h-5 w-5" />
                </button>
                <h3 className="text-xl font-bold text-foreground tracking-tight mb-6">Edit Transaksi</h3>

                {/* Amount & Description — prominent di header */}
                <div className="w-full space-y-4">
                    <div>
                        <label className={labelCls}>Jumlah</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">Rp</span>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={set('amount')}
                                aria-label="Jumlah transaksi"
                                className="w-full bg-muted/30 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground font-bold text-2xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Deskripsi</label>
                        <input type="text" value={form.description} onChange={set('description')} className={inputCls} aria-label="Deskripsi transaksi" />
                    </div>
                </div>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Tipe</label>
                        <select value={form.type} onChange={set('type')} className={inputCls} aria-label="Tipe transaksi">
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                            <option value="transfer">Transfer</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Kategori</label>
                        <input type="text" value={form.category} onChange={set('category')} className={inputCls} placeholder="Belum dikategorikan" />
                    </div>
                    <div>
                        <label className={labelCls}>Metode Bayar</label>
                        <input type="text" value={form.payment_method} onChange={set('payment_method')} className={inputCls} placeholder="—" />
                    </div>
                    <div>
                        <label className={labelCls}>Tanggal</label>
                        <input type="datetime-local" value={form.transaction_date} onChange={set('transaction_date')} className={inputCls} aria-label="Tanggal transaksi" />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Catatan</label>
                    <textarea
                        value={form.notes}
                        onChange={set('notes')}
                        rows={3}
                        placeholder="Tambahkan catatan..."
                        className={`${inputCls} resize-none`}
                    />
                </div>

                {/* Read-only info */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tidak dapat diubah</p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <span>Bank: <span className="text-foreground font-medium">{transaction.bank ?? '—'}</span></span>
                        <span>Sumber: <span className="text-foreground font-medium">{SOURCE_LABELS[transaction.source] ?? transaction.source}</span></span>
                        <span>Dompet: <span className="text-foreground font-medium">{transaction.wallet_name ?? '—'}</span></span>
                        <span>Merchant: <span className="text-foreground font-medium">{transaction.merchant_name ?? '—'}</span></span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-card">
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        <Ban className="h-4 w-4" />
                        Batalkan
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !onSave}
                        className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_15px_oklch(0.55_0.22_240_/_0.25)]"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TransactionDetailModal({
    transaction,
    onClose,
    onDelete,
    onSave,
}: TransactionDetailModalProps) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] bg-card z-[70] shadow-2xl flex flex-col rounded-2xl overflow-hidden border border-border">
                {mode === 'view' ? (
                    <ViewMode
                        transaction={transaction}
                        onEdit={() => setMode('edit')}
                        onClose={onClose}
                        onDelete={onDelete}
                    />
                ) : (
                    <EditMode
                        transaction={transaction}
                        onCancel={() => setMode('view')}
                        onSave={onSave}
                    />
                )}
            </div>
        </>
    );
}
