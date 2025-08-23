'use client';

import { useState, useMemo } from 'react';
import { Holding } from '@/types/portfolio';
import { formatCurrency, formatNumber, getChangeColor } from '@/lib/utils';
import { Edit, Trash2, TrendingUp, TrendingDown, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useDeleteHolding } from '@/hooks/usePortfolio';
import { EditHoldingModal } from './EditHoldingModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HoldingsListProps {
  holdings: Holding[];
  showConvertedValues?: boolean;
}

type SortField = 'symbol' | 'value' | 'gainLoss' | 'gainLossPercent' | 'quantity';
type SortDirection = 'asc' | 'desc';

export function HoldingsList({ holdings, showConvertedValues = false }: HoldingsListProps) {
  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<string>('all');
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Process holdings data
  const processedHoldings = useMemo(() => {
    return holdings.map(holding => {
      const currentValue = holding.currentPrice 
        ? holding.quantity * holding.currentPrice 
        : holding.quantity * holding.costBasis;
      const costValue = holding.quantity * holding.costBasis;
      const gainLoss = currentValue - costValue;
      const gainLossPercent = costValue > 0 ? (gainLoss / costValue) * 100 : 0;

      return {
        ...holding,
        currentValue,
        costValue,
        gainLoss,
        gainLossPercent
      };
    });
  }, [holdings]);

  // Filter and sort holdings
  const filteredAndSortedHoldings = useMemo(() => {
    let filtered = processedHoldings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(holding =>
        holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (holding.name && holding.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(holding => holding.type === filterType);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'value':
          aValue = a.currentValue;
          bValue = b.currentValue;
          break;
        case 'gainLoss':
          aValue = a.gainLoss;
          bValue = b.gainLoss;
          break;
        case 'gainLossPercent':
          aValue = a.gainLossPercent;
          bValue = b.gainLossPercent;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          aValue = a.currentValue;
          bValue = b.currentValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [processedHoldings, searchTerm, filterType, sortField, sortDirection]);

  // Get unique asset types for filter
  const assetTypes = useMemo(() => {
    const types = new Set(holdings.map(h => h.type).filter(Boolean));
    return Array.from(types);
  }, [holdings]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredAndSortedHoldings.reduce((acc, holding) => {
      acc.totalValue += holding.currentValue;
      acc.totalCost += holding.costValue;
      acc.totalGainLoss += holding.gainLoss;
      return acc;
    }, { totalValue: 0, totalCost: 0, totalGainLoss: 0 });
  }, [filteredAndSortedHoldings]);

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
        {/* Header with controls */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search holdings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {assetTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="flex-1">
              <button
                onClick={() => handleSort('symbol')}
                className="flex items-center space-x-1 hover:text-gray-700"
              >
                <span>Symbol</span>
                {getSortIcon('symbol')}
              </button>
            </div>
            <div className="w-24 text-right">
              <button
                onClick={() => handleSort('quantity')}
                className="flex items-center justify-end space-x-1 hover:text-gray-700 w-full"
              >
                <span>Quantity</span>
                {getSortIcon('quantity')}
              </button>
            </div>
            <div className="w-32 text-right">
              <span>Avg Cost</span>
            </div>
            <div className="w-32 text-right">
              <span>Current Price</span>
            </div>
            <div className="w-32 text-right">
              <button
                onClick={() => handleSort('value')}
                className="flex items-center justify-end space-x-1 hover:text-gray-700 w-full"
              >
                <span>Value</span>
                {getSortIcon('value')}
              </button>
            </div>
            <div className="w-40 text-right">
              <button
                onClick={() => handleSort('gainLoss')}
                className="flex items-center justify-end space-x-1 hover:text-gray-700 w-full"
              >
                <span>Gain/Loss</span>
                {getSortIcon('gainLoss')}
              </button>
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Holdings list */}
        <div className="divide-y divide-gray-200">
          {filteredAndSortedHoldings.map((holding) => (
            <div key={holding.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {holding.symbol}
                      </h3>
                      <p className="text-sm text-gray-500">{holding.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {holding.type}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="w-24 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatNumber(holding.quantity)}
                    </p>
                  </div>

                  <div className="w-32 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(holding.costBasis)}
                    </p>
                  </div>

                  <div className="w-32 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {holding.currentPrice 
                        ? formatCurrency(holding.currentPrice)
                        : '-'
                      }
                    </p>
                  </div>

                  <div className="w-32 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(holding.currentValue)}
                    </p>
                  </div>

                  <div className="w-40 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {holding.gainLoss !== 0 && (
                        holding.gainLoss > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )
                      )}
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getChangeColor(holding.gainLoss)}`}>
                          {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
                        </p>
                        <p className={`text-xs ${getChangeColor(holding.gainLoss)}`}>
                          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-16 flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingHolding(holding)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(holding.id)}
                      disabled={deleteHolding.isPending}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Totals row */}
          {filteredAndSortedHoldings.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Total ({filteredAndSortedHoldings.length} positions)</p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="w-24 text-right">
                    <p className="text-sm text-gray-500">-</p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(totals.totalCost)}
                    </p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-500">-</p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(totals.totalValue)}
                    </p>
                  </div>
                  <div className="w-40 text-right">
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getChangeColor(totals.totalGainLoss)}`}>
                        {totals.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totals.totalGainLoss)}
                      </p>
                      <p className={`text-xs ${getChangeColor(totals.totalGainLoss)}`}>
                        {totals.totalCost > 0 ? ((totals.totalGainLoss / totals.totalCost) * 100).toFixed(2) : '0.00'}%
                      </p>
                    </div>
                  </div>
                  <div className="w-16"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredAndSortedHoldings.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No holdings match your search criteria.</p>
          </div>
        )}
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