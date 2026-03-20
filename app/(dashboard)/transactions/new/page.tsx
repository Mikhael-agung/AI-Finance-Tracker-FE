"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWallets, Wallet } from "@/lib/api/wallets";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import {
  Pencil,
  FileUp,
  UploadCloud as Upload,
  Shield,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";

type Tab = "manual" | "import";
type BankType = "BCA" | "BNI_WONDR" | "BNI_MOBILE";

interface PreviewTransaction {
  date: string;
  amount: number;
  type: "income" | "expense";
  merchant: string;
  description: string;
  bank: string;
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
  { value: "BCA", label: "BCA (myBCA / KlikBCA)" },
  { value: "BNI_WONDR", label: "BNI Wondr" },
  { value: "BNI_MOBILE", label: "BNI Mobile Banking" },
];

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (
    searchParams.get("tab") === "import" ? "import" : "manual"
  ) as Tab;

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<BankType>("BCA");
  const [isDragging, setIsDragging] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTransaction[] | null>(
    null,
  );
  const [previewTotal, setPreviewTotal] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWallets()
      .then((data) => {
        setWallets(data);
        if (data.length > 0) setSelectedWallet(data[0].id);
      })
      .catch(() => toast.error("Gagal memuat dompet"))
      .finally(() => setLoadingWallets(false));
  }, []);

  const handleFileSelect = (file: File) => {
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
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handlePreview = async () => {
    if (!selectedFile || !selectedWallet) {
      toast.error("Pilih file PDF dan dompet terlebih dahulu");
      return;
    }
    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bank_type", selectedBank);

      const response = await api.post<{
        preview: PreviewTransaction[];
        total_found: number;
      }>("/import/pdf/preview", formData);
      const result = response.data || response;
      setPreviewData(result.preview || []);
      setPreviewTotal(result.total_found || 0);
      toast.success(`Ditemukan ${result.total_found} transaksi`);
    } catch (err: any) {
      toast.error(err.message || "Gagal preview PDF");
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedWallet) {
      toast.error("Pilih file PDF dan dompet terlebih dahulu");
      return;
    }
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("wallet_id", selectedWallet);
      formData.append("bank_type", selectedBank);

      const response = await api.post<ImportResult>("/import/pdf", formData);
      const result = response.data || response;
      setImportResult(result);
      toast.success(
        `Import berhasil! ${result.inserted} transaksi ditambahkan`,
      );
    } catch (err: any) {
      toast.error(err.message || "Import gagal");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tambah Transaksi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pilih cara menambahkan transaksi
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === "manual"
              ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Pencil className="h-4 w-4" />
          Input Manual
        </button>
        <button
          onClick={() => setActiveTab("import")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === "import"
              ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <FileUp className="h-4 w-4" />
          Import PDF
        </button>
      </div>

      {/* Manual Tab */}
      {activeTab === "manual" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6">
          <p className="text-slate-500 text-sm text-center py-8">
            Form input manual akan ditampilkan di sini.
          </p>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === "import" && (
        <div className="bg-[#0d1117] rounded-2xl border border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-[#161b22]">
            <h3 className="text-lg font-bold text-white">Import Mutasi Bank</h3>
            <p className="text-sm text-slate-400 mt-1">
              Upload file PDF mutasi rekening Anda
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Import Result */}
            {importResult && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-bold text-emerald-400">
                    Import Berhasil!
                  </p>
                </div>
                <p className="text-xs text-slate-300">{importResult.message}</p>
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
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-slate-800/50 rounded-lg p-2 text-center"
                    >
                      <p className={`text-lg font-bold ${item.color}`}>
                        {item.value}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push("/transactions")}
                  className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Lihat Transaksi
                </button>
              </div>
            )}

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                isDragging
                  ? "border-[#0da2e7] bg-[#0da2e7]/10"
                  : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-slate-700 hover:border-[#0da2e7] hover:bg-[#0da2e7]/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                aria-label="Upload file PDF mutasi rekening"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
              />
              {selectedFile ? (
                <>
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / 1024).toFixed(0)} KB • Klik untuk
                    ganti
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#0da2e7]/10 transition-colors">
                    <Upload className="h-7 w-7 text-[#0da2e7]" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    Klik atau seret file PDF
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Maksimal 10MB</p>
                </>
              )}
            </div>

            {/* Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dompet
                </label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  disabled={loadingWallets}
                  aria-label="Dompet"
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
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Tipe Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value as BankType)}
                  aria-label="Tipe Bank"
                  className="w-full bg-[#161b22] border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-[#0da2e7] focus:border-transparent outline-none transition-all"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Results */}
            {previewData && previewData.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Preview ({previewTotal} transaksi ditemukan, menampilkan{" "}
                  {previewData.length})
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {previewData.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate max-w-50">
                          {tx.merchant || tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-xs font-bold shrink-0 ml-2 ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {tx.type === "expense" ? "-" : "+"}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Data diproses secara aman. File PDF tidak disimpan di server
                setelah proses import selesai.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-[#161b22] flex gap-3">
            <button
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
            </button>
            <button
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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
