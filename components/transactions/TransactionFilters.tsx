'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/lib/store/transaction.store';

const TYPE_OPTIONS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'transfer', label: 'Transfer' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Semua Sumber' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'pdf', label: 'PDF' },
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
  };

  const hasActiveFilters =
    searchParams.get('search') ||
    searchParams.get('type') ||
    searchParams.get('source') ||
    searchParams.get('wallet_id');

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari transaksi..."
            className="pl-9"
          />
        </div>

        {/* Type */}
        <select
          value={searchParams.get('type') ?? ''}
          onChange={(e) => updateParam('type', e.target.value)}
          aria-label="Filter tipe transaksi"
          className="h-9 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Source */}
        <select
          value={searchParams.get('source') ?? ''}
          onChange={(e) => updateParam('source', e.target.value)}
          aria-label="Filter sumber transaksi"
          className="h-9 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Wallet */}
        <select
          value={searchParams.get('wallet_id') ?? ''}
          onChange={(e) => updateParam('wallet_id', e.target.value)}
          aria-label="Filter dompet"
          className="h-9 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Semua Dompet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Reset Filter
          </Button>
        )}
      </div>
    </div>
  );
}