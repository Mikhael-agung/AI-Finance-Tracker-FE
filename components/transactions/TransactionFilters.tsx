'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTransactionStore } from '@/lib/store/transaction.store';

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Semua Sumber' },
  { value: 'email', label: 'Gmail' },
  { value: 'pdf_import', label: 'PDF' },
  { value: 'manual', label: 'Manual' },
];

export function TransactionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const wallets = useTransactionStore((s) => s.wallets);
  const fetchWallets = useTransactionStore((s) => s.fetchWallets);

  // Search punya local state biar gak nge-fire router.push tiap ketikan huruf
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1'); // reset ke halaman 1 tiap filter berubah
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Debounce search 400ms biar gak spam request tiap keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get('search') ?? '';
      if (searchInput !== currentSearch) {
        updateParam('search', searchInput);
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleReset = () => {
    setSearchInput('');
    router.push(pathname);
    setPopoverOpen(false);
  };

  const activeFilterCount = [
    searchParams.get('type'),
    searchParams.get('source'),
    searchParams.get('wallet_id'),
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(searchParams.get('search')) || activeFilterCount > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari transaksi..."
            className="pl-9"
          />
        </div>

        {/* Filter popover: gabungan Tipe / Sumber / Dompet dalam satu tombol */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="sm" className="relative shrink-0 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tipe
              </label>
              <select
                value={searchParams.get('type') ?? ''}
                onChange={(e) => updateParam('type', e.target.value)}
                aria-label="Filter tipe transaksi"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sumber
              </label>
              <select
                value={searchParams.get('source') ?? ''}
                onChange={(e) => updateParam('source', e.target.value)}
                aria-label="Filter sumber transaksi"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Dompet
              </label>
              <select
                value={searchParams.get('wallet_id') ?? ''}
                onChange={(e) => updateParam('wallet_id', e.target.value)}
                aria-label="Filter dompet"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <Button variant="secondary" size="sm" className="w-full" onClick={handleReset}>
                Reset Filter
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="hidden shrink-0 sm:inline-flex">
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}