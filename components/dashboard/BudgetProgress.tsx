'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils/formatters';

interface BudgetProgressProps {
  monthlySummary: {
    income: number;
    expenses: number;
    savings: number;
  };
}

const BudgetProgress = ({ monthlySummary }: BudgetProgressProps) => {
  const { income, expenses, savings } = monthlySummary;
  const expensePercentage = income > 0 ? (expenses / income) * 100 : 0;
  const savingPercentage = income > 0 ? (savings / income) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Expense Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Expenses</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(expenses)}
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(income)}
            </span>
          </div>
        </div>
        <div className="relative">
          <Progress 
            value={expensePercentage} 
            className="h-2"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${expensePercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>{expensePercentage.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Savings Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Savings</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(savings)}
            </span>
            <span className="text-muted-foreground">
              of {formatCurrency(income)}
            </span>
          </div>
        </div>
        <div className="relative">
          <Progress 
            value={savingPercentage} 
            className="h-2"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${savingPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>{savingPercentage.toFixed(1)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {expensePercentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Expense Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {savingPercentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Savings Rate</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;