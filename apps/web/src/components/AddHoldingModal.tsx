'use client';

import { useState } from 'react';
import { CreateHoldingRequest, SearchResult } from '@/types/portfolio';
import { useAddHolding } from '@/hooks/usePortfolio';
import { useSearch } from '@/hooks/useSearch';
import { X, Search } from 'lucide-react';

interface AddHoldingModalProps {
  onClose: () => void;
}

export function AddHoldingModal({ onClose }: AddHoldingModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');

  const { data: searchResults, isLoading: isSearching } = useSearch(searchQuery);
  const addHolding = useAddHolding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAsset || !quantity || !costBasis) return;

    const holding: CreateHoldingRequest = {
      symbol: selectedAsset.symbol,
      name: selectedAsset.name,
      type: selectedAsset.type,
      quantity: parseFloat(quantity),
      costBasis: parseFloat(costBasis),
    };

    try {
      await addHolding.mutateAsync(holding);
      onClose();
    } catch (error) {
      console.error('Failed to add holding:', error);
    }
  };

  const selectAsset = (asset: SearchResult) => {
    setSelectedAsset(asset);
    setSearchQuery(asset.symbol);
  };

  console.log('Button clicked, disabled state:', {
    selectedAsset: !!selectedAsset,
    quantity: !!quantity,
    costBasis: !!costBasis,
    isPending: addHolding.isPending,
    disabled: !selectedAsset || !quantity || !costBasis || addHolding.isPending,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add New Holding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Asset Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Asset</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedAsset(null);
                  }}
                  placeholder="Search stocks or crypto..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Search Results */}
              {searchQuery && !selectedAsset && searchResults && searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {searchResults.map((asset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAsset(asset)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-sm text-gray-500">{asset.name}</div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          asset.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {asset.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Asset Display */}
            {selectedAsset && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedAsset.symbol}</div>
                    <div className="text-sm text-gray-500">{selectedAsset.name}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      selectedAsset.type === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {selectedAsset.type}
                  </span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Cost Basis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Average Cost per Share/Coin</label>
              <input
                type="number"
                step="any"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                placeholder="Enter cost basis"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAsset || !quantity || !costBasis || addHolding.isPending}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addHolding.isPending ? 'Adding...' : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
