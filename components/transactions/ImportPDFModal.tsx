'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWallets, Wallet } from '@/lib/api/wallets';
import { api } from '@/lib/api/client';
import { toast } from 'sonner';
import {
    X, Upload, Shield, Loader2, CheckCircle2, AlertCircle, UploadCloud as CloudUpload,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

type BankType = 'BCA' | 'BNI_WONDR' | 'BNI_MOBILE';

interface PreviewTransaction {
    date: string;
    amount: number;
    type: 'income' | 'expense';
    merchant: string;
    description: string;
}

interface ImportResult {
    bank: string;
    total_found: number;
    inserted: number;
    duplicates: number;
    errors: number;
    message: string;
}

const BANK_OPTIONS: { value: BankType; label: string }[] = [
    { value: 'BCA', label: 'BCA (myBCA / KlikBCA)' },
    { value: 'BNI_WONDR', label: 'BNI Wondr' },
    { value: 'BNI_MOBILE', label: 'BNI Mobile Banking' },
];

interface ImportPDFModalProps {
    open: boolean;
    onClose: () => void;
}

export function ImportPDFModal({ open, onClose }: ImportPDFModalProps) {
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loadingWallets, setLoadingWallets] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<string>('');
    const [selectedBank, setSelectedBank] = useState<BankType>('BCA');
    const [isDragging, setIsDragging] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewTransaction[] | null>(null);
    const [previewTotal, setPreviewTotal] = useState(0);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        setLoadingWallets(true);
        fetchWallets()
            .then((data) => {
                setWallets(data);
                if (data.length > 0) setSelectedWallet(data[0].id);
            })
            .catch(() => toast.error('Gagal memuat dompet'))
            .finally(() => setLoadingWallets(false));
    }, [open]);

    useEffect(() => {
        if (!open) {
            setSelectedFile(null);
            setPreviewData(null);
            setImportResult(null);
            setIsDragging(false);
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (open) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const handleFileSelect = (file: File) => {
        if (file.type !== 'application/pdf') { toast.error('Hanya file PDF yang diizinkan'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('Ukuran file maksimal 10MB'); return; }
        setSelectedFile(file);
        setPreviewData(null);
        setImportResult(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, []);

    const handlePreview = async () => {
        if (!selectedFile) { toast.error('Pilih file PDF terlebih dahulu'); return; }
        setPreviewing(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('bank_type', selectedBank);
            const result = await api.post<any>('/import/pdf/preview', formData) as any;
            setPreviewData(result?.preview || result?.data?.preview || []);
            setPreviewTotal(result?.total_found || result?.data?.total_found || 0);
            toast.success('Ditemukan ' + (result?.total_found || result?.data?.total_found) + ' transaksi');
        } catch (err: any) {
            toast.error(err.message || 'Gagal preview PDF');
        } finally {
            setPreviewing(false);
        }
    };

    const handleImport = async () => {
        if (!selectedFile || !selectedWallet) { toast.error('Pilih file PDF dan dompet terlebih dahulu'); return; }
        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('wallet_id', selectedWallet);
            formData.append('bank_type', selectedBank);
            const raw = await api.post<any>('/import/pdf', formData) as any;
            const result = (raw?.bank ? raw : raw?.data) as ImportResult;
            setImportResult(result);
            toast.success('Import berhasil! ' + result?.inserted + ' transaksi ditambahkan');
        } catch (err: any) {
            toast.error(err.message || 'Import gagal');
        } finally {
            setImporting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-xl bg-[#0d1117] text-slate-200 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 bg-[#161b22] flex justify-between items-center shrink-0">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <h3 className="text-xl font-bold text-white">Import Mutasi Bank</h3>
                                <p className="text-sm text-slate-400 mt-1">Upload file PDF mutasi rekening Anda</p>
                            </motion.div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                aria-label="Tutup modal"
                                title="Tutup"
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-400" />
                            </motion.button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 overflow-y-auto">
                            {/* Import Result */}
                            <AnimatePresence>
                                {importResult && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            </motion.div>
                                            <p className="text-sm font-bold text-emerald-400">Import Berhasil!</p>
                                        </div>
                                        <p className="text-xs text-slate-300">{importResult.message}</p>
                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            {[
                                                { label: 'Berhasil', value: importResult.inserted, color: 'text-emerald-400' },
                                                { label: 'Duplikat', value: importResult.duplicates, color: 'text-yellow-400' },
                                                { label: 'Error', value: importResult.errors, color: 'text-rose-400' },
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + i * 0.05 }}
                                                    className="bg-slate-800/50 rounded-lg p-2 text-center"
                                                >
                                                    <p className={'text-lg font-bold ' + item.color}>{item.value}</p>
                                                    <p className="text-[10px] text-slate-400">{item.label}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={() => { onClose(); router.push('/transactions'); }}
                                            className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors"
                                        >
                                            Lihat Transaksi
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Dropzone */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                className={'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ' + (isDragging ? 'border-[#0da2e7] bg-[#0da2e7]/10' : selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 hover:border-[#0da2e7] hover:bg-[#0da2e7]/5')}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    title="Upload file PDF"
                                    aria-label="Upload file PDF mutasi bank"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                />
                                <AnimatePresence mode="wait">
                                    {selectedFile ? (
                                        <motion.div
                                            key="selected"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            className="flex flex-col items-center"
                                        >
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.05 }}
                                                className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                                                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                            </motion.div>
                                            <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB • Klik untuk ganti</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex flex-col items-center"
                                        >
                                            <motion.div whileHover={{ scale: 1.1 }}
                                                className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#0da2e7]/10 transition-colors">
                                                <CloudUpload className="h-7 w-7 text-[#0da2e7]" />
                                            </motion.div>
                                            <p className="text-sm font-bold text-white">Klik atau seret file PDF</p>
                                            <p className="text-xs text-slate-400 mt-1">Maksimal 10MB</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Config */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dompet</label>
                                    <select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}
                                        disabled={loadingWallets} aria-label="Pilih dompet"
                                        className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none transition-all">
                                        {loadingWallets ? <option>Memuat...</option>
                                            : wallets.length === 0 ? <option>Tidak ada dompet</option>
                                            : wallets.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.bank})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tipe Bank</label>
                                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value as BankType)}
                                        aria-label="Pilih tipe bank"
                                        className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none transition-all">
                                        {BANK_OPTIONS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                                    </select>
                                </div>
                            </motion.div>

                            {/* Preview Results */}
                            <AnimatePresence>
                                {previewData && previewData.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Preview ({previewTotal} transaksi, menampilkan {previewData.length})
                                        </p>
                                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                                            {previewData.map((tx, i) => (
                                                <motion.div key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate max-w-[220px]">{tx.merchant || tx.description}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <p className={'text-xs font-bold shrink-0 ml-2 ' + (tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                                                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Security note */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                                className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Data diproses secara aman. File PDF tidak disimpan di server setelah proses import selesai.
                                </p>
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="p-5 border-t border-slate-800 bg-[#161b22] flex gap-3 shrink-0">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handlePreview} disabled={!selectedFile || previewing}
                                className="flex-1 py-3 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                                Preview
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={handleImport} disabled={!selectedFile || !selectedWallet || importing}
                                className="flex-[2] py-3 bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0da2e7]/20">
                                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {importing ? 'Mengimpor...' : 'Import Sekarang'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}