"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWallets, Wallet } from "@/lib/api/wallets";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import {
    X,
    Upload,
    Shield,
    Loader2,
    CheckCircle2,
    AlertCircle,
    UploadCloud as CloudUpload,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";

type BankType = "" | "BCA" | "BNI_WONDR" | "BNI_MOBILE";

interface PreviewTransaction {
    date: string;
    amount: number;
    type: "income" | "expense";
    merchant: string;
    description: string;
    is_duplicate: boolean;
}

interface ImportResult {
    bank: string;
    total_found: number;
    inserted: number;
    duplicates: number;
    errors: number;
    message: string;
}

interface PreviewResponse {
    preview: PreviewTransaction[];
    total_found: number;
    bank: string;
    duplicate_count?: number;
    message: string;
}

interface ImportResponse extends ImportResult { }

const BANK_OPTIONS: { value: BankType; label: string }[] = [
    { value: "", label: "🔍 Auto-detect (Otomatis)" },
    { value: "BCA", label: "BCA (myBCA / KlikBCA)" },
    { value: "BNI_WONDR", label: "BNI Wondr" },
    { value: "BNI_MOBILE", label: "BNI Mobile Banking" },
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
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [selectedBank, setSelectedBank] = useState<BankType>("");
    const [isDragging, setIsDragging] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [importing, setImporting] = useState(false);
    // const [expandPreview, setExpandPreview] = useState(false);
    const [showExpandModal, setExpandModal] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewTransaction[] | null>(null);
    const [previewTotal, setPreviewTotal] = useState(0);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [pdfPassword, setPdfPassword] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [selectedTxs, setSelectedTxs] = useState<Set<number>>(new Set());
    const [duplicateCount, setDuplicateCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const firstFocusRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        setLoadingWallets(true);
        fetchWallets()
            .then((data) => {
                setWallets(data);
                if (data.length > 0) setSelectedWallet(data[0].id);
            })
            .catch(() => toast.error("Gagal memuat dompet"))
            .finally(() => setLoadingWallets(false));
    }, [open]);

    useEffect(() => {
        if (!open) {
            setSelectedFile(null);
            setPreviewData(null);
            setImportResult(null);
            setIsDragging(false);
            setPdfPassword("");
            setNeedsPassword(false);
            setShowPassword(false);
            setShowPasswordModal(false);
        } else {
            // Focus trap — fokus ke tombol close saat modal buka
            setTimeout(() => firstFocusRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const handleFileSelect = useCallback((file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Hanya file PDF yang diizinkan");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 10MB");
            return;
        }
        setSelectedFile(file);
        setPreviewData(null);
        setImportResult(null);
        setSelectedBank("");
        setNeedsPassword(false);
        setPdfPassword("");
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        },
        [handleFileSelect],
    );

    const handlePreview = async () => {
        if (!selectedFile) {
            toast.error("Pilih file PDF terlebih dahulu");
            return;
        }

        if (needsPassword && !pdfPassword) {
            toast.error("Masukkan password PDF untuk melanjutkan");
            return;
        }

        setPreviewing(true);
        setNeedsPassword(false);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            if (selectedBank) formData.append("bank_type", selectedBank);
            if (selectedWallet) formData.append("wallet_id", selectedWallet);
            if (pdfPassword) formData.append("pdf_password", pdfPassword);

            const result = await api.post<{ data: PreviewResponse }>(
                "/import/pdf/preview",
                formData,
            );

            const data = (result as unknown as { data: PreviewResponse }).data;
            const preview = data?.preview || [];
            setPreviewData(preview);
            setPreviewTotal(data?.total_found || 0);
            setDuplicateCount(data?.duplicate_count || 0);

            if (!selectedBank && data?.bank) {
                setSelectedBank(data.bank as BankType);
                toast.info(`Bank terdeteksi: ${data.bank}`);
            }

            const nonDupIndexes = new Set<number>(
                preview
                    .map((tx: PreviewTransaction, i: number) => tx.is_duplicate ? null : i)
                    .filter((i): i is number => i !== null)
            );
            setSelectedTxs(nonDupIndexes);

            toast.success(`Ditemukan ${data?.total_found || 0} transaksi`);
        } catch (err: unknown) {
            // toast.error(err instanceof Error ? err.message : 'Gagal preview PDF');
            const errormsg = err instanceof Error ? err.message : "Gagal preview PDF";
            if (errormsg.toLowerCase().includes("password")) {
                setShowPasswordModal(true);
                toast.warning("PDF dilindungi password. Masukkan password untuk melanjutkan.");
            } else {
                toast.error(errormsg);
            }
        } finally {
            setPreviewing(false);
        }
    };

    const handlePasswordSubmit = async () => {
        if (!pdfPassword) return;
        setPreviewing(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile!);
            if (selectedBank) formData.append("bank_type", selectedBank);
            if (selectedWallet) formData.append("wallet_id", selectedWallet);
            formData.append("pdf_password", pdfPassword);
            const result = await api.post<{ data: PreviewResponse }>("/import/pdf/preview", formData);
            const data = (result as unknown as { data: PreviewResponse }).data;
            const preview = data?.preview || [];
            setPreviewData(preview);
            setPreviewTotal(data?.total_found || 0);
            setDuplicateCount(data?.duplicate_count || 0);
            const nonDupIndexes = new Set<number>(
                preview
                    .map((tx: PreviewTransaction, i: number) => tx.is_duplicate ? null : i)
                    .filter((i): i is number => i !== null)
            );
            setSelectedTxs(nonDupIndexes);
            if (!selectedBank && data?.bank) setSelectedBank(data.bank as BankType);
            setShowPasswordModal(false);
            setPdfPassword("");
            toast.success(`Ditemukan ${data?.total_found || 0} transaksi`);
        } catch (err: unknown) {
            console.log('PDF ERROR RAW:', err);
            const errormsg = err instanceof Error ? err.message : "Gagal preview PDF";
            console.log('PDF ERROR MSG:', errormsg);
            if (errormsg.toLowerCase().includes("password")) {
                setPasswordError(true);
                setTimeout(() => setPasswordError(false), 5000);
            } else {
                toast.error(errormsg);
            }
        } finally {
            setPreviewing(false);
        }
    }

    const handleImport = async () => {
        if (!selectedFile || !selectedWallet) {
            toast.error("Pilih file PDF dan dompet terlebih dahulu");
            return;
        }

        // Kalau sudah preview, kirim hanya yang dipilih
        if (previewData && previewData.length > 0 && selectedTxs.size === 0) {
            toast.warning("Pilih minimal satu transaksi untuk diimport");
            return;
        }

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("wallet_id", selectedWallet);
            if (selectedBank) formData.append("bank_type", selectedBank);
            if (pdfPassword) formData.append("pdf_password", pdfPassword);
            const result = await api.post<{ data: ImportResponse }>(
                "/import/pdf",
                formData,
            );
            const data = (result as unknown as { data: ImportResponse }).data;
            if (data?.inserted !== undefined) {
                setImportResult(data);
                toast.success(
                    `Import berhasil! ${data.inserted} transaksi ditambahkan`,
                );
            } else {
                toast.error("Response tidak valid dari server");
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Import gagal");
        } finally {
            setImporting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="main-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="import-modal-title"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-xl bg-[#0d1117] text-slate-200 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[800px] max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 bg-[#161b22] flex justify-between items-center shrink-0">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3
                                    id="import-modal-title"
                                    className="text-xl font-bold text-white"
                                >
                                    Import Mutasi Bank
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Upload file PDF mutasi rekening Anda
                                </p>
                            </motion.div>
                            <motion.button
                                ref={firstFocusRef}
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
                        <div className="p-6 space-y-5 overflow-y-auto flex-1">
                            {/* Import Result */}
                            <AnimatePresence>
                                {importResult && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: "spring", damping: 20 }}
                                        className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", delay: 0.1 }}
                                            >
                                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                            </motion.div>
                                            <p className="text-sm font-bold text-emerald-400">
                                                Import Berhasil!
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-300">
                                            {importResult.message}
                                        </p>
                                        <div className="grid grid-cols-3 gap-3 mt-3">
                                            {[
                                                {
                                                    label: "Berhasil",
                                                    value: importResult.inserted,
                                                    color: "text-emerald-400",
                                                },
                                                {
                                                    label: "Duplikat",
                                                    value: importResult.duplicates,
                                                    color: "text-yellow-400",
                                                },
                                                {
                                                    label: "Error",
                                                    value: importResult.errors,
                                                    color: "text-rose-400",
                                                },
                                            ].map((item, idx) => (
                                                <motion.div
                                                    key={item.label}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                                    className="bg-slate-800/50 rounded-lg p-2 text-center"
                                                >
                                                    <p className={"text-lg font-bold " + item.color}>
                                                        {item.value}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {item.label}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                onClose();
                                                router.push("/transactions");
                                            }}
                                            className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors"
                                        >
                                            Lihat Transaksi
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    aria-label="Upload file PDF mutasi bank, klik atau seret file ke sini"
                                    className={
                                        "w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group " +
                                        (isDragging
                                            ? "border-[#0da2e7] bg-[#0da2e7]/10"
                                            : selectedFile
                                                ? "border-emerald-500/50 bg-emerald-500/5"
                                                : "border-slate-700 hover:border-[#0da2e7] hover:bg-[#0da2e7]/5")
                                    }
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        title="Upload file PDF"
                                        aria-label="Upload file PDF mutasi bank"
                                        className="hidden"
                                        onChange={(e) =>
                                            e.target.files?.[0] && handleFileSelect(e.target.files[0])
                                        }
                                    />
                                    <AnimatePresence mode="wait">
                                        {selectedFile ? (
                                            <motion.div
                                                key="selected"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 20,
                                                }}
                                                className="flex flex-col items-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", delay: 0.05 }}
                                                    className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3"
                                                >
                                                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                                                </motion.div>
                                                <p className="text-sm font-bold text-white">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {(selectedFile.size / 1024).toFixed(0)} KB • Klik
                                                    untuk ganti
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex flex-col items-center"
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#0da2e7]/10 transition-colors"
                                                >
                                                    <CloudUpload className="h-7 w-7 text-[#0da2e7]" />
                                                </motion.div>
                                                <p className="text-sm font-bold text-white">
                                                    Klik atau seret file PDF
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Maksimal 10MB
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                            {/* Password Input */}{" "}
                            <AnimatePresence>
                                {" "}
                                {needsPassword && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                            <p className="text-xs text-yellow-300">
                                                PDF dilindungi password. Masukkan password untuk
                                                melanjutkan.
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={pdfPassword}
                                                onChange={(e) => setPdfPassword(e.target.value)}
                                                placeholder="Masukkan password PDF..."
                                                className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 pr-10 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handlePreview}
                                            disabled={!pdfPassword || previewing}
                                            className="w-full py-2.5 bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {previewing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : null}
                                            Coba Lagi dengan Password
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div className="space-y-2">
                                    <label
                                        htmlFor="select-wallet"
                                        className="text-xs font-bold text-slate-300 uppercase tracking-wider"
                                    >
                                        Dompet
                                    </label>
                                    <select
                                        id="select-wallet"
                                        value={selectedWallet}
                                        onChange={(e) => setSelectedWallet(e.target.value)}
                                        disabled={loadingWallets}
                                        className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none transition-all"
                                    >
                                        {loadingWallets ? (
                                            <option>Memuat...</option>
                                        ) : wallets.length === 0 ? (
                                            <option>Tidak ada dompet</option>
                                        ) : (
                                            wallets.map((w) => (
                                                <option key={w.id} value={w.id}>
                                                    {w.name} ({w.bank})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="select-bank"
                                        className="text-xs font-bold text-slate-300 uppercase tracking-wider"
                                    >
                                        Tipe Bank
                                    </label>
                                    <select
                                        id="select-bank"
                                        value={selectedBank}
                                        onChange={(e) =>
                                            setSelectedBank(e.target.value as BankType)
                                        }
                                        className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none transition-all"
                                    >
                                        {BANK_OPTIONS.map((b) => (
                                            <option key={b.value} value={b.value}>
                                                {b.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                            {/* Preview Results */}
                            <AnimatePresence>
                                {previewData && previewData.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: "spring", damping: 20 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                Preview ({previewTotal} transaksi
                                                {duplicateCount > 0 && (
                                                    <span className="text-yellow-400"> · {duplicateCount} duplikat</span>
                                                )})
                                            </p>
                                            <div className="flex gap-3 items-center">
                                                <button
                                                    onClick={() => setSelectedTxs(new Set(previewData.map((_, i) => i)))}
                                                    className="text-[10px] text-[#0da2e7] hover:underline"
                                                >
                                                    Pilih Semua
                                                </button>
                                                <button
                                                    onClick={() => setSelectedTxs(new Set(
                                                        previewData.map((tx, i) => tx.is_duplicate ? null : i).filter((i): i is number => i !== null)
                                                    ))}
                                                    className="text-[10px] text-slate-400 hover:underline"
                                                >
                                                    Non-Duplikat
                                                </button>
                                                <button
                                                    onClick={() => setSelectedTxs(new Set())}
                                                    className="text-[10px] text-slate-400 hover:underline"
                                                >
                                                    Hapus Semua
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setExpandModal(true)}
                                                className="text-xs text-[#0da2e7] hover:underline font-medium"
                                            >
                                                Lihat Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-12 gap-2 px-3 py-1.5">
                                            <p className="col-span-1 text-[10px] font-bold text-slate-500 uppercase"></p>
                                            <p className="col-span-2 text-[10px] font-bold text-slate-500 uppercase">Tanggal</p>
                                            <p className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Merchant</p>
                                            <p className="col-span-2 text-[10px] font-bold text-slate-500 uppercase text-center">Tipe</p>
                                            <p className="col-span-3 text-[10px] font-bold text-slate-500 uppercase text-right">Nominal</p>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                            {previewData.slice(0, 10).map((tx, i) => (
                                                <motion.div
                                                    key={`main-${i}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg transition-colors
        ${tx.is_duplicate ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-slate-800/50 hover:bg-slate-800'}
        ${!selectedTxs.has(i) ? 'opacity-50' : ''}
    `}
                                                >
                                                    {/* Checkbox */}
                                                    <div className="col-span-1 flex justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTxs.has(i)}
                                                            onChange={(e) => {
                                                                const next = new Set(selectedTxs);
                                                                e.target.checked ? next.add(i) : next.delete(i);
                                                                setSelectedTxs(next);
                                                            }}
                                                            aria-label={`Pilih transaksi ${tx.merchant} pada ${new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`}
                                                            className="w-3.5 h-3.5 rounded border-slate-600 accent-[#0da2e7] cursor-pointer"
                                                        />
                                                    </div>
                                                    {/* Tanggal */}
                                                    <div className="col-span-2 min-w-0">
                                                        <p className="text-[10px] text-slate-300 font-medium">
                                                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                                        </p>
                                                        <p className="text-[9px] text-slate-500">{new Date(tx.date).getFullYear()}</p>
                                                    </div>
                                                    {/* Merchant */}
                                                    <div className="col-span-4 min-w-0">
                                                        <p className="text-xs font-bold text-white truncate">{tx.merchant}</p>
                                                        {tx.is_duplicate && (
                                                            <span className="text-[9px] text-yellow-400 font-bold">⚠ Duplikat</span>
                                                        )}
                                                    </div>
                                                    {/* Tipe */}
                                                    <div className="col-span-2 flex justify-center items-center">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tx.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                                                            {tx.type === "income" ? "Masuk" : "Keluar"}
                                                        </span>
                                                    </div>
                                                    {/* Nominal */}
                                                    <div className="col-span-3 text-right">
                                                        <p className={`text-xs font-bold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                                                            {tx.type === "expense" ? "-" : "+"}
                                                            {formatCurrency(tx.amount)}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* Security note */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800"
                            >
                                <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Data diproses secara aman. File PDF tidak disimpan di server
                                    setelah proses import selesai.
                                </p>
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-5 border-t border-slate-800 bg-[#161b22] flex gap-3 shrink-0"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handlePreview}
                                disabled={!selectedFile || previewing}
                                className="flex-1 py-3 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {previewing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                Preview
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleImport}
                                disabled={!selectedFile || !selectedWallet || importing}
                                className="flex-[2] py-3 bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#0da2e7]/20"
                            >
                                {importing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {importing ? "Mengimpor..." : "Import Sekarang"}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Modal expand*/}
            {showExpandModal && (
                <motion.div
                    key={"expand-modal"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setExpandModal(false);
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-2xl bg-[#0d1117] text-slate-200 rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 bg-[#161b22] flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-white">Semua Transaksi</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {previewTotal} transaksi ditemukan
                                    {duplicateCount > 0 && (
                                        <span className="text-yellow-400"> · {duplicateCount} duplikat</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedTxs(new Set(previewData!.map((_, i) => i)))}
                                    className="text-[10px] text-[#0da2e7] hover:underline font-bold"
                                >
                                    Pilih Semua
                                </button>
                                <button
                                    onClick={() => setSelectedTxs(new Set(
                                        previewData!.map((tx, i) => tx.is_duplicate ? null : i).filter((i): i is number => i !== null)
                                    ))}
                                    className="text-[10px] text-slate-400 hover:underline"
                                >
                                    Non-Duplikat
                                </button>
                                <button
                                    onClick={() => setSelectedTxs(new Set())}
                                    className="text-[10px] text-slate-400 hover:underline"
                                >
                                    Hapus Semua
                                </button>
                                <button
                                    onClick={() => setExpandModal(false)}
                                    aria-label="Tutup"
                                    className="p-2 hover:bg-slate-800 rounded-full transition-colors ml-2"
                                >
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-slate-800 shrink-0">
                            <p className="col-span-1"></p>
                            <p className="col-span-2 text-[10px] font-bold text-slate-500 uppercase">Tanggal</p>
                            <p className="col-span-4 text-[10px] font-bold text-slate-500 uppercase">Merchant</p>
                            <p className="col-span-2 text-[10px] font-bold text-slate-500 uppercase text-center">Tipe</p>
                            <p className="col-span-3 text-[10px] font-bold text-slate-500 uppercase text-right">Nominal</p>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 p-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {previewData?.map((tx, i) => (
                                <motion.div
                                    key={`expand-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.01 }}
                                    className={`grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg transition-colors
                            ${tx.is_duplicate ? 'bg-yellow-500/5 border border-yellow-500/20' : 'bg-slate-800/50 hover:bg-slate-800'}
                            ${!selectedTxs.has(i) ? 'opacity-50' : ''}
                        `}
                                >
                                    {/* Checkbox */}
                                    <div className="col-span-1 flex justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedTxs.has(i)}
                                            onChange={(e) => {
                                                const next = new Set(selectedTxs);
                                                e.target.checked ? next.add(i) : next.delete(i);
                                                setSelectedTxs(next);
                                            }}
                                            aria-label={`Pilih transaksi ${tx.merchant}`}
                                            className="w-3.5 h-3.5 rounded border-slate-600 accent-[#0da2e7] cursor-pointer"
                                        />
                                    </div>
                                    {/* Tanggal */}
                                    <div className="col-span-2 min-w-0">
                                        <p className="text-[10px] text-slate-300 font-medium">
                                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                        </p>
                                        <p className="text-[9px] text-slate-500">{new Date(tx.date).getFullYear()}</p>
                                    </div>
                                    {/* Merchant */}
                                    <div className="col-span-4 min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{tx.merchant}</p>
                                        {tx.is_duplicate ? (
                                            <span className="text-[9px] text-yellow-400 font-bold">⚠ Duplikat</span>
                                        ) : (
                                            <p className="text-[9px] text-slate-500 truncate">{tx.description}</p>
                                        )}
                                    </div>
                                    {/* Tipe */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tx.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                                            {tx.type === "income" ? "Masuk" : "Keluar"}
                                        </span>
                                    </div>
                                    {/* Nominal */}
                                    <div className="col-span-3 text-right">
                                        <p className={`text-xs font-bold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                                            {tx.type === "expense" ? "-" : "+"}
                                            {formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
                >
                    <motion.div
                        animate={passwordError ? {
                            x: [-10, 10, -10, 10, -6, 6, -3, 3, 0],
                            borderColor: ["#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#ef4444", "#334155"]
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-sm bg-[#0d1117] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 bg-[#161b22] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-yellow-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">PDF Terproteksi</h4>
                                    <p className="text-xs text-slate-400">Masukkan password untuk membuka</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowPasswordModal(false); setPdfPassword(""); }}
                                aria-label="Tutup modal password PDF"
                                title="Tutup"
                                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4">
                            <AnimatePresence>
                                {passwordError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
                                    >
                                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                        <p className="text-xs text-red-300">Password salah. Coba lagi.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={pdfPassword}
                                    onChange={(e) => setPdfPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                                    placeholder="Password PDF..."
                                    autoFocus
                                    className={`w-full bg-[#161b22] border rounded-xl py-3 px-4 pr-12 text-white text-sm focus:ring-2 focus:outline-none transition-all ${passwordError
                                        ? "border-red-500 focus:ring-red-500/30"
                                        : "border-slate-700 focus:ring-[#0da2e7] focus:border-transparent"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handlePasswordSubmit}
                                disabled={!pdfPassword || previewing}
                                className="w-full py-3 bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {previewing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Shield className="h-4 w-4" />
                                )}
                                {previewing ? "Membuka..." : "Buka PDF"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
