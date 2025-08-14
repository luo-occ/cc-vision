'use client';

import { useState } from 'react';
import { usePortfolio, useRefreshPrices } from '@/hooks/usePortfolio';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Error Loading Portfolio</h2>
          <p className="mt-2 text-muted-foreground">Failed to load your portfolio data.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No portfolio data available.</p>
        </div>
      </div>
    );
  }

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
              <div className="text-2xl font-bold text-green-600">+12.5%</div>
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