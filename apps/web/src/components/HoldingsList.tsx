'use client';

import { useState } from 'react';
import { Holding } from '@portfolio/shared';
import { formatCurrency, formatNumber, getChangeColor } from '@/lib/utils';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useDeleteHolding } from '@/hooks/usePortfolio';
import { EditHoldingModal } from './EditHoldingModal';

interface HoldingsListProps {
  holdings: Holding[];
}

export function HoldingsList({ holdings }: HoldingsListProps) {
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const deleteHolding = useDeleteHolding();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this holding?')) {
      try {
        await deleteHolding.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete holding:', error);
      }
    }
  };

  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">No holdings yet. Add your first investment!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {holdings.map((holding) => {
            const currentValue = holding.currentPrice 
              ? holding.quantity * holding.currentPrice 
              : holding.quantity * holding.costBasis;
            const costValue = holding.quantity * holding.costBasis;
            const gainLoss = currentValue - costValue;
            const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;

            return (
              <div key={holding.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {holding.symbol}
                        </h3>
                        <p className="text-sm text-gray-500">{holding.name}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        holding.type === 'stock' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {holding.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(holding.quantity)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Avg Cost</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(holding.costBasis)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current Price</p>
                      <p className="text-sm font-medium text-gray-900">
                        {holding.currentPrice 
                          ? formatCurrency(holding.currentPrice)
                          : '-'
                        }
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Value</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(currentValue)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Gain/Loss</p>
                      <div className="flex items-center space-x-1">
                        {gainLoss !== 0 && (
                          gainLoss > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger-600" />
                          )
                        )}
                        <div>
                          <p className={`text-sm font-medium ${getChangeColor(gainLoss)}`}>
                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                          </p>
                          <p className={`text-xs ${getChangeColor(gainLoss)}`}>
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingHolding(holding)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(holding.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded"
                        disabled={deleteHolding.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingHolding && (
        <EditHoldingModal
          holding={editingHolding}
          onClose={() => setEditingHolding(null)}
        />
      )}
    </>
  );
}