'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatters';

interface SpendingChartProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  period: 'week' | 'month' | 'year';
}

const SpendingChart = ({ data, period }: SpendingChartProps) => {
  const maxAmount = Math.max(...data.map(item => item.amount));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No spending data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.map((item) => {
          const widthPercentage = (item.amount / maxAmount) * 100;
          
          return (
            <div key={item.category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                  <span className="text-muted-foreground text-xs">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    widthPercentage > 50 
                      ? 'bg-red-500' 
                      : widthPercentage > 25 
                      ? 'bg-orange-500' 
                      : 'bg-blue-500'
                  )}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4 border-t text-sm text-muted-foreground">
        Showing top {data.length} categories for {period}
      </div>
    </div>
  );
};

export default SpendingChart;