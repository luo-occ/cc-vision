'use client';

import { useState, useMemo } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { HoldingsList } from '@/components/HoldingsList';
import { AddHoldingModal } from '@/components/AddHoldingModal';
import { Plus, AlertCircle, TrendingUp, PieChart, BarChart3, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { AppLoading } from '@/components/ui/app-loading';

export default function HoldingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConvertedValues, setShowConvertedValues] = useState(false);
  const { data: portfolio, isLoading, error, refetch } = usePortfolio();

  // Render modal outside of conditional returns
  const modal = showAddModal && (
    <AddHoldingModal onClose={() => setShowAddModal(false)} />
  );

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!portfolio?.holdings) return null;

    const holdings = portfolio.holdings;
    
    // Asset class distribution
    const assetClasses = holdings.reduce((acc, holding) => {
      const assetClass = holding.type || 'Other';
      const value = holding.currentPrice 
        ? holding.quantity * holding.currentPrice 
        : holding.quantity * holding.costBasis;
      
      acc[assetClass] = (acc[assetClass] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    // Total portfolio value
    const totalValue = holdings.reduce((sum, holding) => {
      const value = holding.currentPrice 
        ? holding.quantity * holding.currentPrice 
        : holding.quantity * holding.costBasis;
      return sum + value;
    }, 0);

    // Total gain/loss
    const totalGainLoss = holdings.reduce((sum, holding) => {
      const currentValue = holding.currentPrice 
        ? holding.quantity * holding.currentPrice 
        : holding.quantity * holding.costBasis;
      const costValue = holding.quantity * holding.costBasis;
      return sum + (currentValue - costValue);
    }, 0);

    // Top performers
    const topPerformers = holdings
      .map(holding => {
        const currentValue = holding.currentPrice 
          ? holding.quantity * holding.currentPrice 
          : holding.quantity * holding.costBasis;
        const costValue = holding.quantity * holding.costBasis;
        const gainLoss = currentValue - costValue;
        const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;
        
        return {
          ...holding,
          gainLoss,
          gainLossPercent,
          currentValue
        };
      })
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);

    return {
      assetClasses,
      totalValue,
      totalGainLoss,
      totalGainLossPercent: totalValue > 0 ? (totalGainLoss / totalValue) * 100 : 0,
      topPerformers,
      holdingsCount: holdings.length
    };
  }, [portfolio?.holdings]);

  if (isLoading) {
    return (
      <>
        {modal}
        <AppLoading text="Loading holdings..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        {modal}
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">Error Loading Holdings</h2>
            <p className="mt-2 text-muted-foreground">Failed to load your holdings data.</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="mt-2 ml-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!portfolio?.holdings || portfolio.holdings.length === 0) {
    return (
      <>
        {modal}
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
      </>
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
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConvertedValues(!showConvertedValues)}
            >
              {showConvertedValues ? <DollarSign className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
              {showConvertedValues ? 'Show Local Currency' : 'Show Base Currency'}
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        {analyticsData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.holdingsCount} positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${analyticsData.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(analyticsData.totalGainLoss)}
                </div>
                <p className={`text-xs ${analyticsData.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.totalGainLossPercent >= 0 ? '+' : ''}{analyticsData.totalGainLossPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asset Classes</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(analyticsData.assetClasses).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Diversified portfolio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.topPerformers[0]?.symbol || 'N/A'}
                </div>
                <p className={`text-xs ${analyticsData.topPerformers[0]?.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.topPerformers[0]?.gainLossPercent >= 0 ? '+' : ''}{analyticsData.topPerformers[0]?.gainLossPercent?.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="holdings">Positions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            <HoldingsList 
              holdings={portfolio.holdings} 
              showConvertedValues={showConvertedValues}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsData && (
              <>
                {/* Asset Allocation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analyticsData.assetClasses)
                        .sort(([,a], [,b]) => b - a)
                        .map(([assetClass, value]) => {
                          const percentage = (value / analyticsData.totalValue) * 100;
                          return (
                            <div key={assetClass} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{assetClass}</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(value)} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.topPerformers.map((holding, index) => (
                        <div key={holding.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <div className="font-medium">{holding.symbol}</div>
                              <div className="text-sm text-muted-foreground">{holding.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(holding.gainLoss)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}