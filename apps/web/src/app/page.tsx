'use client';

import { useState } from 'react';
import { usePortfolio, useRefreshPrices } from '@/hooks/usePortfolio';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { HoldingsList } from '@/components/HoldingsList';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-danger-600 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Portfolio</h2>
          <p className="mt-2 text-gray-600">Failed to load your portfolio data.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No portfolio data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Tracker</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {new Date(portfolio.lastUpdated).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRefreshPrices}
              disabled={refreshPrices.isPending}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshPrices.isPending ? 'animate-spin' : ''}`} />
              {refreshPrices.isPending ? 'Refreshing...' : 'Refresh Prices'}
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </button>
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