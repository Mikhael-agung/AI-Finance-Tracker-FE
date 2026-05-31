"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api/client";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
RefreshCcw,
CheckCircle2,
AlertTriangle,
XCircle,
History,
} from "lucide-react";
import { toast } from "sonner";

interface SyncHistoryItem {
id: string;
sync_type: "manual" | "auto";
status: "success" | "failed" | "partial" | "pending";
transactions_added: number;
started_at: string;
completed_at: string | null;
error_message: string | null;
duration_ms: number | null;
}

const STATUS_CONFIG = {
success: {
  label: "Berhasil",
  color: "text-emerald-500",
  bg: "bg-emerald-50 dark:bg-emerald-900/20",
  icon: CheckCircle2,
},
failed: {
  label: "Gagal",
  color: "text-rose-500",
  bg: "bg-rose-50 dark:bg-rose-900/20",
  icon: XCircle,
},
partial: {
  label: "Sebagian",
  color: "text-amber-500",
  bg: "bg-amber-50 dark:bg-amber-900/20",
  icon: AlertTriangle,
},
pending: {
  label: "Proses...",
  color: "text-blue-500",
  bg: "bg-blue-50 dark:bg-blue-900/20",
  icon: RefreshCcw,
},
};

interface SyncHistoryProps {
onSyncComplete?: () => void;
triggerPoll?: boolean;
}

export function SyncHistory({ onSyncComplete, triggerPoll }: SyncHistoryProps) {
const [history, setHistory] = useState<SyncHistoryItem[]>([]);
const [loading, setLoading] = useState(true);
const [polling, setPolling] = useState(false);

const fetchHistory = useCallback(async () => {
  try {
    const res = await api.get<any>(`/sync/history?limit=10&_t=${Date.now()}`);
    const items = res.data?.history ?? [];
    setHistory(items);
    return items;
  } catch {
    return [];
  } finally {
    setLoading(false);
  }
}, []);

const startPolling = useCallback(async () => {
  if (polling) return;
  setPolling(true);

  let attempts = 0;
  const maxAttempts = 24; // max 2 menit

  const poll = setInterval(async () => {
    attempts++;
    const items = await fetchHistory();
    const latest = items[0];

    const isRecentPending =
      latest?.status === "pending" &&
      new Date(latest.started_at) > new Date(Date.now() - 10 * 60 * 1000);

    if (!isRecentPending || attempts >= maxAttempts) {
      clearInterval(poll);
      setPolling(false);

      if (latest?.status === "success") {
        toast.success(
          `Sync selesai! +${latest.transactions_added} transaksi`,
        );
        onSyncComplete?.();
      } else if (latest?.status === "failed") {
        toast.error(
          "Sync gagal: " + (latest.error_message || "Unknown error"),
        );
      } else if (latest?.status === "partial") {
        toast.warning(
          `Sync sebagian selesai. +${latest.transactions_added} transaksi`,
        );
        onSyncComplete?.();
      } else if (attempts >= maxAttempts) {
        toast.error("Sync timeout — coba lagi nanti");
      }
    }
  }, 5000);

  return () => clearInterval(poll);
}, [polling, fetchHistory, onSyncComplete]);

useEffect(() => {
  if (triggerPoll) startPolling();
}, [triggerPoll]);

useEffect(() => {
  fetchHistory();
}, [fetchHistory]);

return (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-slate-400" />
        <h4 className="font-bold text-slate-900 dark:text-white">
          Riwayat Sinkronisasi
        </h4>
      </div>
      <button
        onClick={async () => {
          setLoading(true);
          setHistory([]);
          await fetchHistory();
        }}
        className="text-xs text-[#0da2e7] font-bold hover:underline flex items-center gap-1"
      >
        <RefreshCcw className={`h-3 w-3 ${polling ? "animate-spin" : ""}`} />
        {polling ? "Memantau..." : "Refresh"}
      </button>
    </div>

    {loading ? (
      <div className="divide-y divide-slate-100">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-100 animate-pulse rounded" />
              <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    ) : history.length === 0 ? (
      <div className="p-12 text-center text-slate-400">
        <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm font-medium">Belum ada riwayat sinkronisasi</p>
      </div>
    ) : (
      <div className="divide-y divide-slate-100 dark:divide-gray-800">
        {history.map((item) => {
          const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}
                >
                  <Icon
                    className={`h-4 w-4 ${config.color} ${item.status === "pending" ? "animate-spin" : ""}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.sync_type === "manual"
                        ? "Sync Manual"
                        : "Sync Otomatis"}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {format(parseISO(item.started_at), "d MMM yyyy, HH:mm", {
                      locale: id,
                    })}
                    {item.duration_ms &&
                      ` • ${(item.duration_ms / 1000).toFixed(1)}s`}
                  </p>
                  {item.error_message && (
                    <p className="text-xs text-rose-500 mt-0.5">
                      {item.error_message}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  +{item.transactions_added ?? 0}
                </p>
                <p className="text-xs text-slate-400">transaksi</p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
}
