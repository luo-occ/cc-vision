'use client';

import { Portfolio } from '@/types/portfolio';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-muted rounded-lg">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(portfolio.totalCost)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-success" />
              ) : (
                <TrendingDown className="h-6 w-6 text-destructive" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Gain/Loss</p>
              <p className={`text-2xl font-bold font-mono ${getChangeColor(portfolio.totalGainLoss)}`}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}
                {formatCurrency(portfolio.totalGainLoss)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <Percent className={`h-6 w-6 ${isPositive ? 'text-success' : 'text-destructive'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Return</p>
              <p className={`text-2xl font-bold font-mono ${getChangeColor(portfolio.totalGainLoss)}`}>
                {portfolio.totalGainLoss >= 0 ? '+' : ''}
                {formatPercent(portfolio.totalGainLossPercent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}