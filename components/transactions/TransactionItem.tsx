'use client';

import { TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import type { Transaction } from '@/types/transaction.types';
import { formatCurrency } from '@/lib/utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
}

const SOURCE_BADGE_STYLES: Record<string, string> = {
  email: 'bg-destructive/10 text-destructive border-destructive/20',
  pdf_import: 'bg-[oklch(0.75_0.18_60_/_0.1)] text-[oklch(0.55_0.18_60)] border-[oklch(0.75_0.18_60_/_0.2)] dark:text-[oklch(0.78_0.18_60)]',
  manual: 'bg-muted text-muted-foreground border-border',
};

const SOURCE_LABELS: Record<string, string> = {
  email: 'Gmail',
  pdf_import: 'PDF',
  manual: 'Manual',
};

function SourceBadge({ source }: { source: string }) {
  if (!source) return null;
  const style = SOURCE_BADGE_STYLES[source] ?? SOURCE_BADGE_STYLES.manual;
  const label = SOURCE_LABELS[source] ?? source;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${style}`}
    >
      {label}
    </span>
  );
}

function TypeIcon({ type }: { type: Transaction['type'] }) {
  if (type === 'income') return <TrendingUp className="h-4 w-4 text-[var(--chart-3)]" />;
  if (type === 'expense') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <ArrowLeftRight className="h-4 w-4 text-primary" />;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';

  const amountColor = isIncome
    ? 'text-[var(--chart-3)]'
    : isExpense
      ? 'text-destructive'
      : 'text-foreground';

  const amountPrefix = isIncome ? '+' : isExpense ? '-' : '';

  return (
    <TableRow className="hover:bg-muted/40 transition-colors">
      <TableCell className="text-xs text-muted-foreground font-medium whitespace-nowrap px-3 py-2.5">
        {formatDate(transaction.transaction_date)}
      </TableCell>

      <TableCell className="px-3 py-2.5">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0">
            <TypeIcon type={transaction.type} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground leading-snug">
              {transaction.description}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <SourceBadge source={transaction.source} />
              {transaction.bank && (
                <span className="text-[10px] text-muted-foreground italic">{transaction.bank}</span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden sm:table-cell px-3 py-2.5">
        {transaction.category ? (
          <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold uppercase rounded-full tracking-wider">
            {transaction.category}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>

      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground italic whitespace-nowrap px-3 py-2.5">
        {transaction.wallet_name ?? '-'}
      </TableCell>

      <TableCell className={`text-xs font-bold text-right whitespace-nowrap px-3 py-2.5 ${amountColor}`}>
        {amountPrefix}
        {formatCurrency(transaction.amount, transaction.currency)}
      </TableCell>
    </TableRow>
  );
}