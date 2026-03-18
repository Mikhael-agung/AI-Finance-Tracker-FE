'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, Wallet, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

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
  const cards = [
    {
      title: 'Total Balance',
      value: totalBalance,
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Across all wallets',
      formatter: formatCurrency,
    },
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: 'This month',
      formatter: formatCurrency,
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'This month',
      formatter: formatCurrency,
    },
    {
      title: 'Net Flow',
      value: netFlow,
      icon: netFlow >= 0 ? ArrowUpIcon : ArrowDownIcon,
      color: netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: netFlow >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20',
      description: 'Income - Expenses',
      formatter: formatCurrency,
    },
    {
      title: 'Active Wallets',
      value: walletCount,
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'Managed wallets',
      formatter: (value: number) => value.toString(),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const formattedValue = card.formatter(Math.abs(card.value));
        const displayValue = card.title === 'Net Flow' && card.value < 0 ? `-${formattedValue}` : formattedValue;

        return (
          <Card key={card.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-full', card.bgColor)}>
                <Icon className={cn('h-4 w-4', card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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