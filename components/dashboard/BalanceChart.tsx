'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceChartProps {
  period: 'week' | 'month' | 'year';
}

const BalanceChart = ({ period }: BalanceChartProps) => {
  return (
    <div className="h-64 flex items-center justify-center">
      <p className="text-muted-foreground">
        Balance chart will be implemented with Recharts
        <br />
        <span className="text-xs">Period: {period}</span>
      </p>
    </div>
  );
};

export default BalanceChart;