'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';

interface OverviewCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  walletCount: number;
  loading?: boolean;
}

const OverviewCards = ({
  totalBalance,
  totalIncome,
  totalExpenses,
  netFlow,
  walletCount,
  loading = false,
}: OverviewCardsProps) => {
  // Compact jika layar < 1280px (xl) — di sinilah card mulai sempit
  const isCompact = !useMediaQuery('(min-width: 1280px)');
  const currencyFormatter = isCompact ? formatCurrencyCompact : formatCurrency;

  const cards = [
    {
      title: 'Total Saldo',
      value: totalBalance,
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: `${walletCount} dompet aktif`,
      formatter: currencyFormatter,
    },
    {
      title: 'Pemasukan',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'Bulan ini',
      formatter: currencyFormatter,
    },
    {
      title: 'Pengeluaran',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'Bulan ini',
      formatter: currencyFormatter,
    },
    {
      title: 'Tabungan',
      value: netFlow,
      icon: netFlow >= 0 ? ArrowUpIcon : ArrowDownIcon,
      color: netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: netFlow >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
      description: `${((netFlow / (totalIncome || 1)) * 100).toFixed(0)}% dari pemasukan`,
      formatter: currencyFormatter,
    },
    {
      title: 'Dompet Aktif',
      value: walletCount,
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'Dompet terkelola',
      formatter: (value: number) => value.toString(),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-6 w-32 bg-muted rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const formattedValue = card.formatter(Math.abs(card.value));
        const displayValue = card.title === 'Tabungan' && card.value < 0 ? `-${formattedValue}` : formattedValue;

        return (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate pr-2">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-full shrink-0', card.bgColor)}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {displayValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewCards;