'use client';

import { PortfolioSummary as PortfolioSummaryType } from '@portfolio/shared';
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: PortfolioSummaryType;
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.totalValue)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <DollarSign className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio.totalCost)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-success-50' : 'bg-danger-50'}`}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6 text-success-600" />
            ) : (
              <TrendingDown className="h-6 w-6 text-danger-600" />
            )}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
            <p className={`text-2xl font-bold ${getChangeColor(portfolio.totalGainLoss)}`}>
              {portfolio.totalGainLoss >= 0 ? '+' : ''}
              {formatCurrency(portfolio.totalGainLoss)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-success-50' : 'bg-danger-50'}`}>
            <Percent className={`h-6 w-6 ${isPositive ? 'text-success-600' : 'text-danger-600'}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Return</p>
            <p className={`text-2xl font-bold ${getChangeColor(portfolio.totalGainLoss)}`}>
              {portfolio.totalGainLoss >= 0 ? '+' : ''}
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}