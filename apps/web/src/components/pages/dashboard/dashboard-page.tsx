'use client';

import { useState } from 'react';
import { usePortfolio, useRefreshPrices } from '@/hooks/usePortfolio';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional content skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();
  const refreshPrices = useRefreshPrices();

  const handleRefreshPrices = async () => {
    try {
      await refreshPrices.mutateAsync();
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-10">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">
            Error Loading Portfolio
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Failed to load your portfolio data. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Welcome to Your Portfolio</h2>
          <p className="mt-2 text-muted-foreground mb-6">
            Start tracking your investments by adding your first holding.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Holding
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-6 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back! Here's your portfolio overview.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefreshPrices}
              disabled={refreshPrices.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
              {refreshPrices.isPending ? 'Refreshing...' : 'Refresh Prices'}
            </Button>
            
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummary portfolio={portfolio} />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.holdings?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active positions in your portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(portfolio.lastUpdated).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(portfolio.lastUpdated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {portfolio.totalGainLossPercent > 0 ? '+' : ''}
                {portfolio.totalGainLossPercent.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall portfolio performance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <AddHoldingModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}