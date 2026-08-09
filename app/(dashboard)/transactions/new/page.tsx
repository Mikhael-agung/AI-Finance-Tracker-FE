"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Pencil, FileUp } from "lucide-react";
import { ImportPDFModal } from "@/components/transactions/ImportPDFModal";

type Tab = "manual" | "import";

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") === "import" ? "import" : "manual") as Tab;

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [importOpen, setImportOpen] = useState(initialTab === "import");

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "import") setImportOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tambah Transaksi</h1>
        <p className="text-sm text-slate-500 mt-1">Pilih cara menambahkan transaksi</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => handleTabClick("manual")}
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
          onClick={() => handleTabClick("import")}
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

      {activeTab === "manual" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6">
          <p className="text-slate-500 text-sm text-center py-8">
            Form input manual akan ditampilkan di sini.
          </p>
        </div>
      )}

      <ImportPDFModal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setActiveTab("manual");
        }}
      />
    </div>
  );
}