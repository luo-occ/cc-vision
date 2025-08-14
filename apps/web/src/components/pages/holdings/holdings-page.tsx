'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { HoldingsList } from '@/components/HoldingsList';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HoldingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading holdings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Error Loading Holdings</h2>
          <p className="mt-2 text-muted-foreground">Failed to load your holdings data.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!portfolio?.holdings || portfolio.holdings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">No Holdings Yet</h2>
          <p className="mt-2 text-muted-foreground mb-6">
            Start building your portfolio by adding your first holding.
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Holding
          </Button>
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
            <h1 className="text-3xl font-bold text-foreground">Holdings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and track all your investment positions.
            </p>
          </div>
          
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Holding
          </Button>
        </div>

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