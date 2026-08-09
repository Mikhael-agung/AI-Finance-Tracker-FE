'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionSummary } from '@/components/transactions/TransactionSummary';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionExportMenu } from '@/components/transactions/TransactionExportMenu';
import { TransactionDetailModal } from '@/components/transactions/TransactionDetailModal';
import { useTransactionStore } from '@/lib/store/transaction.store';
import type { TransactionFilters as TransactionFiltersType } from '@/types/api.types';
import type { Transaction } from '@/types/transaction.types';
import { toast } from 'sonner';

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
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const fetchSummaryAgain = useTransactionStore((s) => s.fetchSummary);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

      {/* ← TAMBAH onRowClick */}
      <TransactionTable onRowClick={(tx) => setSelectedTx(tx)} />

      {/* ← TAMBAH MODAL */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onDelete={async (id) => {
            setDeleteError(null);
            try {
              await deleteTransaction(id);
              setSelectedTx(null);
              fetchSummary('month');
            } catch (err) {
              setDeleteError(
                err instanceof Error ? err.message : 'Gagal menghapus transaksi. Silakan coba lagi.',
              );
            }
          }}
          onSave={async (id, updates) => {
            try {
              await updateTransaction(id, updates);
              setSelectedTx(null);
              fetchSummary('month');
              toast.success('Transaksi berhasil diperbarui');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Gagal memperbarui transaksi.';
              toast.error(message);
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}