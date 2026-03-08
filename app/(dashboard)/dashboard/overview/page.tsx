'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchRecentTransactions, fetchTransactionSummary, fetchSpendingByCategory } from '@/lib/api/transactions';
import { fetchWalletSummary } from '@/lib/api/wallets';
import { Transaction } from '@/types/transaction.types';
import { useRouter } from 'next/navigation';
import {
  RefreshCcw,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Mail,
  AlertTriangle,
  Car,
  ShoppingBag,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatters';
import { api } from '@/lib/api/client';

interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  walletCount: number;
  recentTransactions: Transaction[];
  spendingByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  transportasi: <Car className="h-5 w-5" />,
  belanja: <ShoppingBag className="h-5 w-5" />,
  makanan: <UtensilsCrossed className="h-5 w-5" />,
  default: <Wallet className="h-5 w-5" />,
};

function getCategoryIcon(category: string) {
  const key = category.toLowerCase();
  for (const [k, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return CATEGORY_ICONS.default;
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    walletCount: 0,
    recentTransactions: [],
    spendingByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [walletSummary, summary, recentTx, spending] = await Promise.allSettled([
        fetchWalletSummary(),
        fetchTransactionSummary('month'),
        fetchRecentTransactions(5),
        fetchSpendingByCategory('month'),
      ]);

      setData({
        totalBalance: walletSummary.status === 'fulfilled' ? walletSummary.value.totalBalance : 0,
        walletCount: walletSummary.status === 'fulfilled' ? walletSummary.value.walletCount : 0,
        totalIncome: summary.status === 'fulfilled' ? summary.value.totalIncome : 0,
        totalExpenses: summary.status === 'fulfilled' ? summary.value.totalExpenses : 0,
        netFlow: summary.status === 'fulfilled' ? summary.value.netFlow : 0,
        recentTransactions: recentTx.status === 'fulfilled' ? recentTx.value : [],
        spendingByCategory: spending.status === 'fulfilled' ? spending.value : [],
      });
    } catch {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/sync/trigger');
      toast.success('Sinkronisasi berhasil!');
      setLastSynced('baru saja');
      await loadDashboardData();
    } catch {
      toast.error('Sinkronisasi gagal');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const savings = data.totalIncome - data.totalExpenses;
  const savingsPercent = data.totalIncome > 0
    ? Math.round((savings / data.totalIncome) * 100)
    : 0;

  const chartBars = [40, 60, 45, 75, 65, 90];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Halo! 👋</h2>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <RefreshCcw className="h-3 w-3" />
            {lastSynced ? `Terakhir sinkronisasi: ${lastSynced}` : 'Belum pernah sinkronisasi'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/transactions/new')}
            className="bg-sky-500 hover:bg-sky-500/90 text-white font-bold gap-2 rounded-xl shadow-md"
          >
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white font-bold gap-2 rounded-xl shadow-md"
          >
            <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Sekarang'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Saldo */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <p className="text-sm text-slate-500 font-semibold mb-1">Total Saldo</p>
          {loading ? (
            <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(data.totalBalance)}
            </h3>
          )}
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>{data.walletCount} dompet aktif</span>
          </div>
          <div
            className="absolute bottom-0 left-0 w-full h-12 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(180deg, rgba(13,162,231,0.2) 0%, rgba(13,162,231,0) 100%)' }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 35 Q 25 25, 50 30 T 100 10" fill="none" stroke="#0da2e7" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Pemasukan (Bulan ini)</p>
          {loading ? (
            <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(data.totalIncome)}
            </h3>
          )}
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>Bulan ini</span>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Pengeluaran (Bulan ini)</p>
          {loading ? (
            <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(data.totalExpenses)}
            </h3>
          )}
          <div className="flex items-center gap-1.5 text-rose-500 text-sm font-bold">
            <TrendingDown className="h-4 w-4" />
            <span>Bulan ini</span>
          </div>
        </div>

        {/* Tabungan */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Tabungan</p>
          {loading ? (
            <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {formatCurrency(Math.max(0, savings))}
            </h3>
          )}
          <div className="flex items-center gap-1.5 text-[#0da2e7] text-sm font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>{savingsPercent}% dari pemasukan</span>
          </div>
        </div>
      </div>

      {/* Row 2: Chart + Sync Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tren Pengeluaran */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tren Pengeluaran</h4>
              <p className="text-xs text-slate-500 font-medium">6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0da2e7]/10 px-3 py-1.5 rounded-full">
              <span className="text-xs font-bold text-[#0da2e7] tracking-tight">✨ Gemini AI</span>
            </div>
          </div>
          <div className="h-48 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-end px-4 gap-3">
            {chartBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${h}%`,
                  background: i === chartBars.length - 1
                    ? '#0da2e7'
                    : `rgba(13,162,231,${0.2 + i * 0.1})`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3 px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'].map((m, i) => (
              <span
                key={m}
                className={`text-xs font-medium ${i === 5 ? 'text-slate-700 dark:text-white font-bold' : 'text-slate-400'}`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Gmail Sync Status */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Sinkronisasi Gmail</h4>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Terhubung</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Gmail Terhubung</p>
                <p className="text-xs text-slate-500 font-medium">Google OAuth</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bulan ini</p>
                <p className="text-md font-bold text-slate-900 dark:text-white">
                  {data.recentTransactions.length} Transaksi
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-md font-bold text-emerald-500">Aktif</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="mt-auto w-full rounded-xl font-bold border-dashed hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Manual'}
          </Button>
        </div>
      </div>

      {/* Row 3: Transactions + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h4>
            <button
              onClick={() => router.push('/transactions')}
              className="text-[#0da2e7] text-sm font-bold hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="size-11 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-slate-100 animate-pulse rounded" />
                    <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : data.recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Belum ada transaksi</p>
              <p className="text-xs mt-1">Coba sync Gmail kamu</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => router.push(`/transactions/${tx.id}`)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {getCategoryIcon(tx.category || '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                        {tx.payment_method === 'email' && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                            <Mail className="h-2.5 w-2.5" /> Gmail
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {tx.category || 'Lainnya'} •{' '}
                        {new Date(tx.transaction_date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-500'
                    : tx.type === 'expense' ? 'text-rose-500'
                    : 'text-[#0da2e7]'
                  }`}>
                    {tx.type === 'expense' ? '- ' : tx.type === 'income' ? '+ ' : ''}
                    {formatCurrency(Math.abs(tx.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Pengeluaran per Kategori
          </h4>

          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 animate-pulse rounded" />
                  <div className="h-2.5 w-full bg-slate-100 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          ) : data.spendingByCategory.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-6">
              {data.spendingByCategory.slice(0, 4).map((item) => {
                const isHigh = item.percentage > 80;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.category}</p>
                        {isHigh && (
                          <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Hati-hati! Sisa {(100 - item.percentage).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          background: isHigh ? '#f43f5e' : '#0da2e7',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => router.push('/budgets/new')}
            className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-500 font-bold text-sm hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all"
          >
            + Tambah Anggaran
          </button>
        </div>
      </div>
    </div>
  );
}