'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionSummary } from '@/components/transactions/TransactionSummary';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionExportMenu } from '@/components/transactions/TransactionExportMenu';
import { useTransactionStore } from '@/lib/store/transaction.store';
import type { TransactionFilters as TransactionFiltersType } from '@/types/api.types';

function parseSearchParams(searchParams: URLSearchParams): TransactionFiltersType {
  const filters: TransactionFiltersType = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const walletId = searchParams.get('wallet_id');

  if (search) filters.search = search;
  if (type) filters.type = type as TransactionFiltersType['type'];
  if (source) (filters as any).source = source;
  if (walletId) filters.wallet_id = walletId;

  return filters;
}

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchSummary = useTransactionStore((s) => s.fetchSummary);

  useEffect(() => {
    const filters = parseSearchParams(searchParams);
    fetchTransactions(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchSummary('month');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Transaksi</h1>
          <p className="text-sm text-muted-foreground">
            Pantau dan kelola seluruh arus keuangan kamu di satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TransactionExportMenu />
          <Button onClick={() => router.push('/transactions/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      <TransactionSummary />
      <TransactionFilters />
      <TransactionTable />
    </div>
  );
}