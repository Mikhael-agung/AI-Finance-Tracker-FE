'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import ENDPOINTS from '@/lib/api/endpoints';
import { DashboardOverview } from '@/types/api.types';
import OverviewCards from '@/components/dashboard/OverviewCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import BalanceChart from '@/components/dashboard/BalanceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.get<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW, {
        period,
        report_type: 'monthly'
      });
      setDashboardData(data);
      toast.success('Dashboard data updated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      toast.error(message);
      
      // Redirect to login if unauthorized
      if (err instanceof Error && err.message.includes('Session expired')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
    setPeriod(newPeriod);
  };

  if (loading && !dashboardData) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Failed to Load Dashboard
            </CardTitle>
            <CardDescription>
              There was an error loading your dashboard data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/transactions')} variant="default">
                Go to Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Your financial summary and insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards
        totalBalance={dashboardData.total_balance}
        totalIncome={dashboardData.total_income}
        totalExpenses={dashboardData.total_expenses}
        netFlow={dashboardData.net_flow}
        walletCount={dashboardData.wallet_count}
        loading={loading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Top spending categories for {period}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingChart
              data={dashboardData.top_categories}
              period={period}
            />
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>
              Track your budget utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetProgress
              monthlySummary={dashboardData.monthly_summary}
            />
          </CardContent>
        </Card>
      </div>

      {/* Balance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Trend</CardTitle>
          <CardDescription>
            Your balance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BalanceChart period={period} />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest transactions across all wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions
            transactions={dashboardData.recent_transactions}
            loading={loading}
            limit={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}