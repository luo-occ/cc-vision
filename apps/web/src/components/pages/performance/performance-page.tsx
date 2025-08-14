'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PerformancePage() {
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Error Loading Performance</h2>
          <p className="mt-2 text-muted-foreground">Failed to load your performance data.</p>
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
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">No Performance Data</h2>
          <p className="mt-2 text-muted-foreground">Add holdings to your portfolio to see performance metrics.</p>
        </div>
      </div>
    );
  }

  // Calculate some basic performance metrics
  const totalValue = portfolio.holdings.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
  const totalCost = portfolio.holdings.reduce((sum, holding) => sum + holding.quantity * (holding.costBasis || 0), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-6 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Performance</h1>
          <p className="mt-1 text-muted-foreground">Track your portfolio's performance and analyze your investments.</p>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Current portfolio value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total investment cost</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                $
                {Math.abs(totalGainLoss).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalGainLoss >= 0 ? 'Unrealized gains' : 'Unrealized losses'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Return %</CardTitle>
              {totalGainLossPercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercent >= 0 ? '+' : ''}
                {totalGainLossPercent.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Overall return percentage</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-muted/10 border-2 border-dashed border-muted">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Performance chart coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holdings Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.holdings.map((holding) => {
                const costBasis = holding.costBasis || 0;
                const gainLoss = (holding.currentValue || 0) - holding.quantity * costBasis;
                const gainLossPercent =
                  costBasis > 0 ? (((holding.currentPrice || 0) - costBasis) / costBasis) * 100 : 0;

                return (
                  <div key={holding.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h3 className="font-semibold">{holding.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holding.quantity} shares @ ${costBasis.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toFixed(2)}
                      </div>
                      <div className={`text-sm ${gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainLossPercent >= 0 ? '+' : ''}
                        {gainLossPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
