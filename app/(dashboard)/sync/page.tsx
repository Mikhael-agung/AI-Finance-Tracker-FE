'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { syncApi } from '@/lib/api/sync';
import { formatCurrency } from '@/lib/utils/formatters';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  RefreshCcw, Mail, CheckCircle2, AlertTriangle,
  XCircle, Clock, Wifi, WifiOff, ExternalLink,
  History, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SyncStatus {
  connected: boolean;
  is_expired: boolean;
  needs_refresh: boolean;
  expires_at: string | null;
  last_sync: string | null;
  total_email_transactions: number;
  synced_wallets: Array<{
    id: string;
    name: string;
    sync_email: string;
    last_synced: string | null;
  }>;
}

interface SyncHistoryItem {
  id: string;
  sync_type: 'manual' | 'auto';
  status: 'success' | 'failed' | 'partial' | 'pending';
  transactions_added: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  duration_ms: number | null;
}

const STATUS_CONFIG = {
  success: { label: 'Berhasil', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
  failed: { label: 'Gagal', color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle },
  partial: { label: 'Sebagian', color: 'text-amber-500', bg: 'bg-amber-50', icon: AlertTriangle },
  pending: { label: 'Proses...', color: 'text-blue-500', bg: 'bg-blue-50', icon: RefreshCcw },
};

export default function SyncPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [history, setHistory] = useState<SyncHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.allSettled([
        api.get<any>('/sync/status'),
        api.get<any>('/sync/history', { limit: 10 }),
      ]);

      if (statusRes.status === 'fulfilled') {
        setStatus(statusRes.value.data);
      }
      if (historyRes.status === 'fulfilled') {
        setHistory(historyRes.value.data?.history ?? []);
      }
    } catch {
      toast.error('Gagal memuat status sync');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/sync/trigger');
      toast.success('Sinkronisasi dimulai! Tunggu 1-2 menit.');
      setTimeout(() => loadData(), 3000);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('wait')) {
        toast.error('Batas sync harian tercapai. Reset tengah malam.');
      } else if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('gmail')) {
        toast.error('Gmail tidak terhubung. Silakan reconnect.');
      } else {
        toast.error('Sinkronisasi gagal: ' + msg);
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleReconnect = () => {
    router.push('/login?reconnect=true');
  };

  useEffect(() => {
    loadData();
  }, []);

  const isTokenExpired = status?.is_expired || !status?.connected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sinkronisasi Gmail</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola koneksi Gmail dan riwayat sinkronisasi</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing || isTokenExpired}
          className="bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white font-bold gap-2 rounded-xl shadow-md disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Sekarang'}
        </Button>
      </div>

      {/* Banner Warning Token Expired */}
      {isTokenExpired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800">Gmail Tidak Terhubung</p>
            <p className="text-sm text-amber-700 mt-1">
              {status?.is_expired
                ? 'Token Gmail kamu sudah expired. Sinkronisasi otomatis tidak berjalan sampai kamu reconnect.'
                : 'Gmail belum terhubung. Hubungkan Gmail untuk mulai sync transaksi otomatis.'}
            </p>
            <Button
              onClick={handleReconnect}
              className="mt-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Reconnect Gmail
            </Button>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500">Status Gmail</p>
            {status?.connected && !status?.is_expired
              ? <Wifi className="h-4 w-4 text-emerald-500" />
              : <WifiOff className="h-4 w-4 text-rose-500" />
            }
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded" />
          ) : (
            <>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status?.connected && !status?.is_expired
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
                }`}>
                {status?.connected && !status?.is_expired
                  ? <><CheckCircle2 className="h-3 w-3" /> Terhubung</>
                  : <><XCircle className="h-3 w-3" /> {status?.is_expired ? 'Token Expired' : 'Tidak Terhubung'}</>
                }
              </div>
              <p className="text-xs text-slate-400 mt-2">Google OAuth</p>
            </>
          )}
        </div>

        {/* Last Sync */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500">Terakhir Sync</p>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          {loading ? (
            <div className="h-6 w-32 bg-slate-100 animate-pulse rounded" />
          ) : (
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {status?.last_sync
                ? format(parseISO(status.last_sync), 'd MMM yyyy, HH:mm', { locale: id })
                : 'Belum pernah sync'}
            </p>
          )}
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-500">Total Transaksi Email</p>
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          {loading ? (
            <div className="h-6 w-16 bg-slate-100 animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {status?.total_email_transactions ?? 0}
            </p>
          )}
        </div>
      </div>

      {/* Synced Wallets */}
      {status?.synced_wallets && status.synced_wallets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-800">
            <h4 className="font-bold text-slate-900 dark:text-white">Dompet Tersinkronisasi</h4>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-gray-800">
            {status.synced_wallets.map((wallet) => (
              <div key={wallet.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0da2e7]/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#0da2e7]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{wallet.name}</p>
                    <p className="text-xs text-slate-500">{wallet.sync_email}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {wallet.last_synced
                    ? format(parseISO(wallet.last_synced), 'd MMM, HH:mm', { locale: id })
                    : 'Belum pernah'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">Riwayat Sinkronisasi</h4>
          </div>
          <button onClick={loadData} className="text-xs text-[#0da2e7] font-bold hover:underline">
            Refresh
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
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${config.color} ${item.status === 'pending' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.sync_type === 'manual' ? 'Sync Manual' : 'Sync Otomatis'}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(item.started_at), 'd MMM yyyy, HH:mm', { locale: id })}
                        {item.duration_ms && ` • ${(item.duration_ms / 1000).toFixed(1)}s`}
                      </p>
                      {item.error_message && (
                        <p className="text-xs text-rose-500 mt-0.5">{item.error_message}</p>
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

      {/* Auto Sync Info */}
      <div className="bg-[#0da2e7]/5 border border-[#0da2e7]/20 rounded-xl p-4 flex items-start gap-3">
        <Zap className="h-5 w-5 text-[#0da2e7] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#0da2e7]">Sinkronisasi Otomatis Aktif</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem otomatis sync email bank setiap tengah malam (00:00 WIB).
            Kamu juga bisa sync manual maksimal 5x per hari.
          </p>
        </div>
      </div>
    </div>
  );
}