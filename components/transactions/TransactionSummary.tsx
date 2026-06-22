'use client';

import { Receipt, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactionStore } from '@/lib/store/transaction.store';
import { formatCurrency } from '@/lib/utils/formatters';

export function TransactionSummary() {
    const summary = useTransactionStore((s) => s.summary);
    const summaryLoading = useTransactionStore((s) => s.summaryLoading);
    const totalItems = useTransactionStore((s) => s.pagination.totalItems);

    const cards = [
        {
            label: 'Jumlah Transaksi',
            value: totalItems.toLocaleString('id-ID'),
            icon: Receipt,
            colorVar: 'var(--chart-1)',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary',
        },
        {
            label: 'Pemasukan',
            value: formatCurrency(summary.totalIncome, 'IDR'),
            icon: TrendingUp,
            colorVar: 'var(--chart-3)',
            bgClass: 'bg-[var(--chart-3)]/10',
            textClass: 'text-[var(--chart-3)]',
        },
        {
            label: 'Pengeluaran',
            value: formatCurrency(summary.totalExpenses, 'IDR'),
            icon: TrendingDown,
            colorVar: 'var(--chart-5)',
            bgClass: 'bg-destructive/10',
            textClass: 'text-destructive',
        },
        {
            label: 'Arus Kas',
            value: formatCurrency(summary.netFlow, 'IDR'),
            icon: Wallet,
            colorVar: 'var(--chart-1)',
            bgClass: 'bg-primary/10',
            textClass: 'text-primary',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card key={card.label} className="border-border">
                    <CardContent className="p-5 flex flex-col gap-3">
                        <div className={`w-fit p-2.5 rounded-xl ${card.bgClass}`}>
                            <card.icon className={`h-5 w-5 ${card.textClass}`} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                {card.label}
                            </p>
                            {summaryLoading && card.label !== 'Jumlah Transaksi' ? (
                                <Skeleton className="h-7 w-28 mt-1.5" />
                            ) : (
                                <h3 className={`text-2xl font-bold mt-1 ${card.textClass}`}>{card.value}</h3>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}