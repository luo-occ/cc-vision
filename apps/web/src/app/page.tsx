'use client';

import { useState } from 'react';
import { usePortfolio, useRefreshPrices } from '@/hooks/usePortfolio';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { HoldingsList } from '@/components/HoldingsList';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No portfolio data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefreshPrices}
              disabled={refreshPrices.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
              {refreshPrices.isPending ? 'Refreshing...' : 'Refresh Prices'}
            </Button>
            
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary portfolio={portfolio} />

        {/* Holdings List */}
        <HoldingsList holdings={portfolio.holdings} />
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <AddHoldingModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}