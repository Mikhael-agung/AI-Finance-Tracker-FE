'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatters';
import { formatDate } from '@/lib/utils/formatters';
import { Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
  limit?: number;
}

const RecentTransactions = ({
  transactions,
  loading = false,
  limit = 5,
}: RecentTransactionsProps) => {
  const router = useRouter();
  const [visibleTransactions] = useState(
    transactions.slice(0, limit)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'expense':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleViewTransaction = (id: string) => {
    router.push(`/transactions/${id}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visibleTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/transactions/new')}
        >
          Add Your First Transaction
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{transaction.description}</span>
                  {transaction.wallet_name && (
                    <span className="text-xs text-muted-foreground">
                      {transaction.wallet_name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {transaction.category || 'Uncategorized'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(transaction.type)}>
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(transaction.transaction_date)}
              </TableCell>
              <TableCell className="text-right font-medium">
                <span
                  className={
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : transaction.type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }
                >
                  {transaction.type === 'expense' ? '-' : ''}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewTransaction(transaction.id)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {transactions.length > limit && (
        <div className="border-t p-4 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/transactions')}
          >
            View All Transactions ({transactions.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;