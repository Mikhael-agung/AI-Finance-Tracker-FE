'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { fetchTransactions, fetchRecentTransactions, fetchTransactionSummary, fetchSpendingByCategory } from '@/lib/api/transactions';
import { fetchWalletSummary } from '@/lib/api/wallets';
import { Transaction } from '@/types/transaction.types';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import {
  RefreshCcw, Plus, TrendingUp, TrendingDown, CheckCircle2,
  Mail, AlertTriangle, Car, ShoppingBag, UtensilsCrossed,
  Wallet, CalendarIcon,
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
  totalTransactions: number;
  recentTransactions: Transaction[];
  spendingByCategory: Array<{ category: string; amount: number; percentage: number }>;
}

interface ChartBar {
  label: string;
  expense: number;
  income: number;
  height: number;
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

function buildChartData(transactions: Transaction[], dateRange: DateRange): ChartBar[] {
  if (!dateRange.from || !dateRange.to) return [];

  const diffDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const groupByWeek = diffDays > 14;

  let buckets: { label: string; from: Date; to: Date }[] = [];

  if (groupByWeek) {
    const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }, { weekStartsOn: 1 });
    buckets = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return {
        label: format(weekStart, 'd MMM', { locale: id }),
        from: weekStart,
        to: weekEnd > dateRange.to! ? dateRange.to! : weekEnd,
      };
    });
  } else {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    buckets = days.map((day) => ({
      label: format(day, 'd MMM', { locale: id }),
      from: day,
      to: day,
    }));
  }

  const data = buckets.map(({ label, from, to }) => {
    const inRange = transactions.filter((tx) => {
      const txDate = parseISO(tx.transaction_date as string);
      const fromMidnight = new Date(from); fromMidnight.setHours(0, 0, 0, 0);
      const toMidnight = new Date(to); toMidnight.setHours(23, 59, 59, 999);
      return txDate >= fromMidnight && txDate <= toMidnight;
    });
    const expense = inRange.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const income = inRange.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { label, expense, income, height: 0 };
  });

  const maxVal = Math.max(...data.map((d) => Math.max(d.expense, d.income)), 1);
  return data.map((d) => {
    if (d.expense === 0) return { ...d, height: 0 };
    const logVal = Math.log1p(d.expense);
    const logMax = Math.log1p(maxVal);
    const height = Math.round((logVal / logMax) * 100);
    return { ...d, height: Math.max(height, 15) };
  });
}

function formatLastSynced(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMins < 1) return 'baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return format(date, 'd MMM yyyy, HH:mm', { locale: id });
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0, totalIncome: 0, totalExpenses: 0, netFlow: 0,
    walletCount: 0, totalTransactions: 0,
    recentTransactions: [], spendingByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [chartBars, setChartBars] = useState<ChartBar[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const loadChartData = useCallback(async (range: DateRange) => {
    if (!range.from || !range.to) return;
    setChartLoading(true);
    try {
      const result = await fetchTransactions({
        start_date: range.from.toISOString(),
        end_date: range.to.toISOString(),
        limit: 100,
        sort_by: 'transaction_date',
        sort_order: 'asc',
      });
      setChartBars(buildChartData(result.transactions, range));
    } catch {
      // silent fail
    } finally {
      setChartLoading(false);
    }
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [walletSummary, summary, recentTx, spending, monthlyCount] = await Promise.allSettled([
        fetchWalletSummary(),
        fetchTransactionSummary('month'),
        fetchRecentTransactions(5),
        fetchSpendingByCategory('month'),
        fetchTransactions({
          start_date: startOfMonth(new Date()).toISOString(),
          end_date: new Date().toISOString(),
          limit: 1,
        }),
      ]);

      setData({
        totalBalance: walletSummary.status === 'fulfilled' ? walletSummary.value.totalBalance : 0,
        walletCount: walletSummary.status === 'fulfilled' ? walletSummary.value.walletCount : 0,
        totalIncome: summary.status === 'fulfilled' ? summary.value.totalIncome : 0,
        totalExpenses: summary.status === 'fulfilled' ? summary.value.totalExpenses : 0,
        netFlow: summary.status === 'fulfilled' ? summary.value.netFlow : 0,
        recentTransactions: recentTx.status === 'fulfilled' ? recentTx.value : [],
        spendingByCategory: spending.status === 'fulfilled' ? spending.value : [],
        totalTransactions: monthlyCount.status === 'fulfilled' ? monthlyCount.value.totalItems : 0,
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
      setLastSynced(new Date());
      await loadDashboardData();
      await loadChartData(dateRange);
    } catch {
      toast.error('Sinkronisasi gagal');
    } finally {
      setSyncing(false);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setDateRange(range);
    if (range.from && range.to) {
      setCalendarOpen(false);
      loadChartData(range);
    }
  };

  const setPreset = (days: number) => {
    const range = { from: subDays(new Date(), days), to: new Date() };
    setDateRange(range);
    setCalendarOpen(false);
    loadChartData(range);
  };

  useEffect(() => {
    loadDashboardData();
    loadChartData(dateRange);
  }, []);

  const savings = data.totalIncome - data.totalExpenses;
  const savingsPercent = data.totalIncome > 0 ? Math.round((savings / data.totalIncome) * 100) : 0;

  const dateRangeLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'd MMM', { locale: id })} – ${format(dateRange.to, 'd MMM yyyy', { locale: id })}`
    : 'Pilih tanggal';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Halo! 👋</h2>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <RefreshCcw className="h-3 w-3" />
            {lastSynced ? `Terakhir sinkronisasi: ${formatLastSynced(lastSynced)}` : 'Belum pernah sinkronisasi'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/transactions/new')}
            className="bg-sky-500 hover:bg-sky-500/90 text-white font-bold gap-2 rounded-xl shadow-md">
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </Button>
          <Button onClick={handleSync} disabled={syncing}
            className="bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white font-bold gap-2 rounded-xl shadow-md">
            <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Sekarang'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Total Saldo</p>
          {loading ? <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(data.totalBalance)}</h3>
          )}
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /><span>{data.walletCount} dompet aktif</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Pemasukan (Bulan ini)</p>
          {loading ? <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(data.totalIncome)}</h3>
          )}
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /><span>Bulan ini</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Pengeluaran (Bulan ini)</p>
          {loading ? <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(data.totalExpenses)}</h3>
          )}
          <div className="flex items-center gap-1.5 text-rose-500 text-sm font-bold">
            <TrendingDown className="h-4 w-4" /><span>Bulan ini</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-slate-500 font-semibold mb-1">Tabungan</p>
          {loading ? <div className="h-8 w-36 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(Math.max(0, savings))}</h3>
          )}
          <div className="flex items-center gap-1.5 text-[#0da2e7] text-sm font-bold">
            <TrendingUp className="h-4 w-4" /><span>{savingsPercent}% dari pemasukan</span>
          </div>
        </div>
      </div>

      {/* Row 2: Chart + Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tren Pengeluaran</h4>
              <p className="text-xs text-slate-500 font-medium">{dateRangeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {[{ label: '7H', days: 7 }, { label: '30H', days: 30 }, { label: '90H', days: 90 }].map(({ label, days }) => (
                  <button key={days} onClick={() => setPreset(days)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-500 hover:bg-[#0da2e7]/10 hover:text-[#0da2e7] transition-all">
                    {label}
                  </button>
                ))}
              </div>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Pilih Tanggal</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b border-slate-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rentang Cepat</p>
                    <div className="flex gap-2">
                      {[
                        { label: 'Hari ini', days: 0 },
                        { label: '7 hari', days: 7 },
                        { label: '30 hari', days: 30 },
                        { label: 'Bulan ini', days: -1 },
                      ].map(({ label, days }) => (
                        <button key={label}
                          onClick={() => {
                            if (days === -1) {
                              const range = { from: startOfMonth(new Date()), to: new Date() };
                              setDateRange(range); setCalendarOpen(false); loadChartData(range);
                            } else if (days === 0) {
                              const today = new Date();
                              const range = { from: today, to: today };
                              setDateRange(range); setCalendarOpen(false); loadChartData(range);
                            } else {
                              setPreset(days);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-[#0da2e7]/10 hover:text-[#0da2e7] transition-all">
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeSelect}
                    numberOfMonths={2} locale={id} disabled={{ after: new Date() }} />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 bg-[#0da2e7]/10 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-[#0da2e7] tracking-tight">✨ Gemini AI</span>
              </div>
            </div>
          </div>

          {chartLoading ? (
            <div className="h-48 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : chartBars.length === 0 ? (
            <div className="h-48 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400 text-sm font-medium">Belum ada data untuk rentang ini</p>
            </div>
          ) : (
            <>
              <div className="h-48 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-end px-4 pb-2 gap-1 overflow-x-auto">
                {chartBars.map((bar, i) => (
                  <div key={i} className="flex-1 min-w-[20px] flex flex-col justify-end items-center group/bar relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {formatCurrency(bar.expense)}
                    </div>
                    <div className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
                      style={{
                        height: bar.expense > 0 ? `${Math.max(bar.height, 8)}%` : '4px',
                        background: i === chartBars.length - 1 ? '#0da2e7' : `rgba(13,162,231,${0.25 + (i / chartBars.length) * 0.6})`,
                      }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 px-1 overflow-hidden">
                {chartBars
                  .filter((_, i) => chartBars.length <= 8 || i % Math.ceil(chartBars.length / 8) === 0 || i === chartBars.length - 1)
                  .map((bar, i, arr) => (
                    <span key={i} className={`text-[10px] font-medium ${i === arr.length - 1 ? 'text-slate-700 dark:text-white font-bold' : 'text-slate-400'}`}>
                      {bar.label}
                    </span>
                  ))}
              </div>
            </>
          )}
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
                  {loading ? '...' : `${data.totalTransactions} Transaksi`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                <p className="text-md font-bold text-emerald-500">Aktif</p>
              </div>
            </div>
          </div>
          <Button onClick={handleSync} disabled={syncing} variant="outline"
            className="mt-auto w-full rounded-xl font-bold border-dashed hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all">
            <RefreshCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Manual'}
          </Button>
        </div>
      </div>

      {/* Row 3: Transactions + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h4>
            <button onClick={() => router.push('/transactions')} className="text-[#0da2e7] text-sm font-bold hover:underline">
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
                <div key={tx.id} onClick={() => router.push(`/transactions/${tx.id}`)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between cursor-pointer">
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
                        {new Date(tx.transaction_date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'expense' ? 'text-rose-500' : 'text-[#0da2e7]'}`}>
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
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Pengeluaran per Kategori</h4>
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
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, background: isHigh ? '#f43f5e' : '#0da2e7' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => router.push('/budgets/new')}
            className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-500 font-bold text-sm hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all">
            + Tambah Anggaran
          </button>
        </div>
      </div>
    </div>
  );
}