'use client';

import { useState } from 'react';
import { Holding } from '@/types/portfolio';
import { UpdateHoldingRequest } from '@/hooks/usePortfolio';
import { useUpdateHolding } from '@/hooks/usePortfolio';
import { X } from 'lucide-react';

interface EditHoldingModalProps {
  holding: Holding;
  onClose: () => void;
}

export function EditHoldingModal({ holding, onClose }: EditHoldingModalProps) {
  const [quantity, setQuantity] = useState((holding?.quantity ?? 0).toString());
  const [costBasis, setCostBasis] = useState((holding?.costBasis ?? 0).toString());

  const updateHolding = useUpdateHolding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: UpdateHoldingRequest = {};
    
    if (parseFloat(quantity) !== (holding?.quantity ?? 0)) {
      updates.quantity = parseFloat(quantity);
    }
    
    if (parseFloat(costBasis) !== (holding?.costBasis ?? 0)) {
      updates.costBasis = parseFloat(costBasis);
    }

    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      await updateHolding.mutateAsync({ id: holding.id, updates });
      onClose();
    } catch (error) {
      console.error('Failed to update holding:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Holding</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Asset Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{holding.symbol}</div>
                <div className="text-sm text-gray-500">{holding.name}</div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                holding.type === 'stock' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {holding.type}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Cost Basis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Cost per Share/Coin
              </label>
              <input
                type="number"
                step="any"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
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
              disabled={updateHolding.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateHolding.isPending ? 'Updating...' : 'Update Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}