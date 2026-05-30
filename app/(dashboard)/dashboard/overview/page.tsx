'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { fetchTransactions } from '@/lib/api/transactions';
import { GmailTokenBanner } from '@/components/sync/GmailTokenBanner';
import { SyncNotification, type SyncState } from '@/components/sync/SyncNotification';
// import { fetchWalletSummary } from '@/lib/api/wallets';
import { Transaction } from '@/types/transaction.types';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { ImportPDFModal } from '@/components/transactions/ImportPDFModal';
import {
  RefreshCcw, Plus, TrendingUp, TrendingDown, CheckCircle2,
  Mail, AlertTriangle, Car, ShoppingBag, UtensilsCrossed,
  Wallet, CalendarIcon, ReceiptText, Pencil, FileUp, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/formatters';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { api } from '@/lib/api/client';
import { useDashboardStore } from '@/lib/store/dashboard.store';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

const PIE_COLORS = ['#0da2e7', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#10b981'];

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
  const groupByWeek = diffDays > 60;
  let buckets: { label: string; from: Date; to: Date }[] = [];
  if (groupByWeek) {
    const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }, { weekStartsOn: 1 });
    buckets = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return { label: format(weekStart, 'd MMM', { locale: id }), from: weekStart, to: weekEnd > dateRange.to! ? dateRange.to! : weekEnd };
    });
  } else {
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    buckets = days.map((day) => ({ label: format(day, 'd MMM', { locale: id }), from: day, to: day }));
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
  const MAX_BAR_HEIGHT_PX = 120;
  return data.map((d) => {
    if (d.expense === 0) return { ...d, height: 0 };
    const logVal = Math.log1p(d.expense);
    const logMax = Math.log1p(maxVal);
    const height = Math.round((logVal / logMax) * MAX_BAR_HEIGHT_PX);
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl">
        <p>{payload[0].name}</p>
        <p className="text-[#0da2e7]">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const isCompact = !useMediaQuery('(min-width: 768px)');
  const fmt = isCompact ? formatCurrencyCompact : formatCurrency;
  const [syncing, setSyncing] = useState(false);
  const { data, loading, gmailStatus, lastSynced, fetchDashboard, setLastSynced, invalidate } = useDashboardStore();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [chartBars, setChartBars] = useState<ChartBar[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [newTransactions, setNewTransactions] = useState(0);
  const [syncsUsed, setSyncsUsed] = useState(0);
  const MAX_SYNCS = 5;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    } catch { } finally {
      setChartLoading(false);
    }
  }, []);

  const handleSync = async () => {
    if (syncsUsed >= MAX_SYNCS) { setSyncState('limit_reached'); return; }
    setSyncing(true);
    try {
      const result = await api.post<{ new_transactions?: number; transactions_added?: number }>('/sync/trigger');
      const count = result.data?.new_transactions ?? result.data?.transactions_added ?? 0;
      setNewTransactions(count);
      setSyncsUsed((prev) => prev + 1);
      setLastSynced(new Date());
      setSyncState('success');
      await fetchDashboard(true);
      await loadChartData(dateRange);
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('wait')) {
        setSyncState('limit_reached');
      } else {
        toast.error('Sinkronisasi gagal');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) return;
    setDateRange(range);
    if (range.from && range.to) { setCalendarOpen(false); loadChartData(range); }
  };

  const setPreset = (days: number) => {
    localStorage.setItem('dashboard_preset', String(days));
    const range = { from: subDays(new Date(), days), to: new Date() };
    setDateRange(range); setCalendarOpen(false); loadChartData(range);
  };

  const setPresetMonth = () => {
    localStorage.setItem('dashboard_preset', '-1');
    const range = { from: startOfMonth(new Date()), to: new Date() };
    setDateRange(range); setCalendarOpen(false); loadChartData(range);
  };

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_preset');
    if (saved) {
      const days = parseInt(saved);
      const range = days === -1
        ? { from: startOfMonth(new Date()), to: new Date() }
        : { from: subDays(new Date(), days), to: new Date() };
      setDateRange(range);
      loadChartData(range);
    } else {
      loadChartData(dateRange);
    }
    fetchDashboard();
  }, []);;

  const savings = data.totalIncome - data.totalExpenses;
  const savingsPercent = data.totalIncome > 0 ? Math.round((savings / data.totalIncome) * 100) : 0;
  const dateRangeLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'd MMM', { locale: id })} – ${format(dateRange.to, 'd MMM yyyy', { locale: id })}`
    : 'Pilih tanggal';

  const pieData = data.spendingByCategory.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  return (
    <div className="space-y-6">
      <GmailTokenBanner />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Halo! 👋</h2>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
            <RefreshCcw className="h-3 w-3" />
            {lastSynced ? `Terakhir sinkronisasi: ${formatLastSynced(lastSynced)}` : 'Belum pernah sinkronisasi'}
          </p>
        </div>

        {/* Tombol stack vertical di mobile, horizontal di desktop */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          <div className="relative" ref={addMenuRef}>
            <Button
              onClick={() => setAddMenuOpen((prev) => !prev)}
              className="bg-sky-500 hover:bg-sky-500/90 text-white font-bold gap-2 rounded-xl shadow-md"
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${addMenuOpen ? 'rotate-180' : ''}`} />
            </Button>

            {addMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setAddMenuOpen(false); router.push('/transactions/new'); }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <Pencil className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Input Manual</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tambah transaksi secara manual</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setAddMenuOpen(false); setImportModalOpen(true); }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <FileUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Import Mutasi Bank</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Upload PDF dari BCA, BNI Wondr, atau BNI Mobile</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSync} disabled={syncing}
            className="bg-[#0da2e7] hover:bg-[#0da2e7]/90 text-white font-bold gap-2 rounded-xl shadow-md">
            <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Sekarang'}
          </Button>
        </div>
      </div>

      {/* Row 1: Stats Cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Total Saldo</p>
          {loading ? <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white mb-2">{fmt(data.totalBalance)}</h3>
          )}
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
            <TrendingUp className="h-3 w-3" /><span>{data.walletCount} dompet aktif</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Pemasukan</p>
          {loading ? <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white mb-2">{fmt(data.totalIncome)}</h3>
          )}
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
            <TrendingUp className="h-3 w-3" /><span>Bulan ini</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Pengeluaran</p>
          {loading ? <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white mb-2">{fmt(data.totalExpenses)}</h3>
          )}
          <div className="flex items-center gap-1 text-rose-500 text-xs font-bold">
            <TrendingDown className="h-3 w-3" /><span>Bulan ini</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs md:text-sm text-slate-500 font-semibold mb-1">Tabungan</p>
          {loading ? <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mb-2" /> : (
            <h3 className="text-base md:text-2xl font-bold text-slate-900 dark:text-white mb-2">{fmt(Math.max(0, savings))}</h3>
          )}
          <div className="flex items-center gap-1 text-[#0da2e7] text-xs font-bold">
            <TrendingUp className="h-3 w-3" /><span>{savingsPercent}% dari pemasukan</span>
          </div>
        </div>
      </div>

      {/* Row 2: Chart + Gmail Sync */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tren Pengeluaran</h4>
              <p className="text-xs text-slate-500 font-medium">{dateRangeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {[{ label: '7H', days: 7 }, { label: '30H', days: 30 }, { label: '90H', days: 90 }].map(({ label, days }) => (
                  <button key={days} onClick={() => setPreset(days)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg text-slate-500 hover:bg-[#0da2e7]/10 hover:text-[#0da2e7] transition-all">{label}</button>
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
                      {[{ label: 'Hari ini', days: 0 }, { label: '7 hari', days: 7 }, { label: '30 hari', days: 30 }].map(({ label, days }) => (
                        <button key={label} onClick={() => {
                          if (days === 0) {
                            localStorage.setItem('dashboard_preset', '0');
                            const today = new Date();
                            const range = { from: today, to: today };
                            setDateRange(range); setCalendarOpen(false); loadChartData(range);
                          } else { setPreset(days); }
                        }} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-[#0da2e7]/10 hover:text-[#0da2e7] transition-all">{label}</button>
                      ))}
                      <button onClick={setPresetMonth}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300 hover:bg-[#0da2e7]/10 hover:text-[#0da2e7] transition-all">
                        Bulan ini
                      </button>
                    </div>
                  </div>
                  <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeSelect} numberOfMonths={2} locale={id} disabled={{ after: new Date() }} />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 bg-[#0da2e7]/10 px-3 py-1.5 rounded-full">
                <span className="text-xs font-bold text-[#0da2e7] tracking-tight">✨ Gemini AI</span>
              </div>
            </div>
          </div>
          {chartLoading ? (
            <div className="h-56 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-slate-300 animate-spin" />
            </div>
          ) : chartBars.length === 0 ? (
            <div className="h-56 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-400 text-sm font-medium">Belum ada data untuk rentang ini</p>
            </div>
          ) : (
            <>
              <div className="h-44 w-full bg-slate-50 dark:bg-gray-800 rounded-lg flex items-end px-3 pb-2 gap-1 overflow-x-auto">
                {chartBars.map((bar, i) => (
                  <div key={i} className="flex-1 min-w-6 flex flex-col justify-end items-center relative" style={{ height: '100%' }}>
                    {bar.expense > 0 && (
                      <span className="absolute text-[8px] font-bold text-slate-400 whitespace-nowrap pointer-events-none z-10"
                        style={{ bottom: `calc(${bar.height}px + 4px)`, left: '50%', transform: 'translateX(-50%) rotate(-45deg)', transformOrigin: 'bottom left' }}>
                        {bar.expense >= 1000000 ? `${(bar.expense / 1000000).toFixed(1)}jt` : bar.expense >= 1000 ? `${(bar.expense / 1000).toFixed(0)}rb` : `${bar.expense}`}
                      </span>
                    )}
                    <div className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
                      style={{ height: bar.expense > 0 ? `${bar.height}px` : '4px', background: i === chartBars.length - 1 ? '#0da2e7' : `rgba(13,162,231,${0.25 + (i / chartBars.length) * 0.6})` }} />
                  </div>
                ))}
              </div>
              {/* Labels */}
              <div className="flex mt-1 px-3 gap-1 overflow-x-hidden">
                {chartBars.map((bar, i) => (
                  <div key={i} className="flex-1 min-w-6 text-center overflow-hidden">
                    <span className={`text-[9px] font-medium block truncate ${i === chartBars.length - 1
                      ? 'text-[#0da2e7] font-bold'
                      : bar.expense > 0
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-300 dark:text-slate-600'
                      }`}>
                      {chartBars.length <= 10 || i % 2 === 0 || i === chartBars.length - 1 ? bar.label : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gmail Sync */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Sinkronisasi Gmail</h4>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${gmailStatus?.is_expired
              ? 'bg-rose-50 text-rose-600'
              : gmailStatus?.connected
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-100 text-slate-500'
              }`}>
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {gmailStatus?.is_expired ? 'Expired' : gmailStatus?.connected ? 'Terhubung' : 'Tidak Aktif'}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Gmail Terhubung</p>
                <p className="text-xs text-slate-500 font-medium">Google OAuth</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bulan ini</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{loading ? '...' : `${data.totalTransactions} Transaksi`}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                <p className={`text-sm font-bold ${gmailStatus?.is_expired
                  ? 'text-rose-500'
                  : gmailStatus?.can_sync_now
                    ? 'text-emerald-500'
                    : 'text-slate-400'
                  }`}>
                  {gmailStatus?.is_expired ? 'Expired' : gmailStatus?.can_sync_now ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleSync} disabled={syncing} variant="outline"
            className="mt-auto w-full rounded-xl font-bold border-dashed hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all text-sm">
            <RefreshCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Manual'}
          </Button>
        </div>
      </div>

      {/* Row 3 + 4: 6 widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Transaksi Terbaru */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h4>
            <button onClick={() => router.push('/transactions')} className="text-[#0da2e7] text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
                    <div className="h-2.5 w-20 bg-slate-100 animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-16 bg-slate-100 animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : data.recentTransactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Mail className="h-7 w-7 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-gray-800">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} onClick={() => router.push(`/transactions/${tx.id}`)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                      {getCategoryIcon(tx.category || '')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{tx.description}</p>
                        {tx.payment_method === 'email' && (
                          <span className="px-1 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-[9px] font-bold text-slate-500 flex items-center gap-0.5 shrink-0">
                            <Mail className="h-2 w-2" /> Gmail
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {tx.category || 'Lainnya'} • {new Date(tx.transaction_date).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs font-bold shrink-0 ml-2 ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'expense' ? 'text-rose-500' : 'text-[#0da2e7]'}`}>
                    {tx.type === 'expense' ? '- ' : tx.type === 'income' ? '+ ' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie Chart Kategori */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Kategori Bulan Ini</h4>
          {loading ? (
            <div className="h-52 bg-slate-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400">
              <p className="text-sm font-medium text-center">Belum ada data kategori</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pengeluaran per Kategori */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">Pengeluaran per Kategori</h4>
          {loading ? (
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3.5 w-28 bg-slate-100 animate-pulse rounded" />
                  <div className="h-2.5 w-full bg-slate-100 animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          ) : data.spendingByCategory.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-5">
              {data.spendingByCategory.slice(0, 4).map((item) => {
                const isHigh = item.percentage > 80;
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.category}</p>
                        {isHigh && (
                          <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />Hati-hati! Sisa {(100 - item.percentage).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, background: isHigh ? '#f43f5e' : '#0da2e7' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => router.push('/budgets/new')}
            className="w-full mt-6 py-2.5 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-500 font-bold text-sm hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all">
            + Tambah Anggaran
          </button>
        </div>

        {/* Statistik Bulan Ini */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">Statistik Bulan Ini</h4>
          <div className="space-y-4">
            {[
              { icon: <ReceiptText className="h-5 w-5" />, bg: 'bg-[#0da2e7]/10 text-[#0da2e7]', label: 'Total transaksi', value: `${data.totalTransactions} transaksi`, color: 'text-slate-900 dark:text-white' },
              { icon: <TrendingUp className="h-5 w-5" />, bg: 'bg-[#0da2e7]/10 text-[#0da2e7]', label: 'Rata-rata harian', value: `${formatCurrency(Math.round(data.totalExpenses / Math.max(new Date().getDate(), 1)))}/hari`, color: 'text-slate-900 dark:text-white' },
              { icon: <TrendingDown className="h-5 w-5" />, bg: 'bg-rose-100 text-rose-500', label: 'Total pengeluaran', value: formatCurrency(data.totalExpenses), color: 'text-rose-500' },
              { icon: <TrendingUp className="h-5 w-5" />, bg: 'bg-emerald-100 text-emerald-500', label: 'Total pemasukan', value: formatCurrency(data.totalIncome), color: 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>{stat.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                  {loading ? <div className="h-4 w-24 bg-slate-100 animate-pulse rounded mt-1" /> : (
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Terkini */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">Aktivitas Terkini</h4>
          <div className="relative space-y-5 before:absolute before:inset-0 before:ml-1.5 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-gray-700">
            {[
              { color: 'bg-[#0da2e7]', badge: 'bg-blue-50 text-blue-600', label: 'Sync', desc: 'Sinkronisasi Gmail berhasil', time: lastSynced ? formatLastSynced(lastSynced) : '-' },
              { color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600', label: 'Transaksi', desc: `${data.totalTransactions} transaksi bulan ini`, time: 'Bulan ini' },
              { color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600', label: 'Budget', desc: 'Cek anggaran kamu', time: '' },
              { color: 'bg-slate-400', badge: 'bg-slate-100 text-slate-500', label: 'Sistem', desc: 'Gmail terhubung aktif', time: '' },
            ].map((item, i) => (
              <div key={i} className="relative flex items-start gap-4 pl-6">
                <div className={`absolute left-0 top-1 size-3 rounded-full border-2 border-white dark:border-gray-900 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${item.badge}`}>{item.label}</span>
                    {item.time && <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tagihan Rutin */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-slate-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">Tagihan Rutin</h4>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : data.recentTransactions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada data tagihan</p>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 4).map((tx) => {
                const isPaid = new Date(tx.transaction_date) <= new Date();
                return (
                  <div key={tx.id} className="p-3 bg-slate-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-35">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 text-[10px] font-bold rounded-lg ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isPaid ? 'Selesai' : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => router.push('/transactions')}
            className="w-full mt-4 py-2.5 border-2 border-dashed border-slate-200 dark:border-gray-700 rounded-xl text-slate-500 font-bold text-sm hover:border-[#0da2e7] hover:text-[#0da2e7] transition-all">
            Lihat Semua Transaksi
          </button>
        </div>

      </div>

      <ImportPDFModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <SyncNotification
        state={syncState}
        newTransactions={newTransactions}
        syncsUsed={syncsUsed}
        maxSyncs={MAX_SYNCS}
        onClose={() => setSyncState('idle')}
      />
    </div>
  );
}