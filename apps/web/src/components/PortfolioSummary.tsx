'use client';

import { Portfolio } from '@/types/portfolio';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedNumber } from '@/components/ui/animated-number';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  // Handle NaN values by defaulting to 0
  const safeTotalValue = isNaN(portfolio.totalValue) ? 0 : portfolio.totalValue;
  const safeTotalCost = isNaN(portfolio.totalCost) ? 0 : portfolio.totalCost;
  const safeTotalGainLoss = isNaN(portfolio.totalGainLoss) ? 0 : portfolio.totalGainLoss;
  const safeTotalGainLossPercent = isNaN(portfolio.totalGainLossPercent) ? 0 : portfolio.totalGainLossPercent;
  
  const isPositive = safeTotalGainLoss >= 0;

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
              <div className="text-2xl font-bold text-foreground font-mono">
                <AnimatedNumber 
                  value={safeTotalValue} 
                  format="currency"
                  duration={800}
                />
              </div>
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
              <div className="text-2xl font-bold text-foreground font-mono">
                <AnimatedNumber 
                  value={safeTotalCost} 
                  format="currency"
                  duration={800}
                />
              </div>
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
              <div className={`text-2xl font-bold font-mono ${getChangeColor(safeTotalGainLoss)}`}>
                <AnimatedNumber 
                  value={safeTotalGainLoss} 
                  format="currency"
                  duration={800}
                  prefix={safeTotalGainLoss >= 0 ? '+' : ''}
                />
              </div>
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
              <div className={`text-2xl font-bold font-mono ${getChangeColor(safeTotalGainLoss)}`}>
                <AnimatedNumber 
                  value={safeTotalGainLossPercent} 
                  format="percent"
                  duration={800}
                  prefix={safeTotalGainLoss >= 0 ? '+' : ''}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}