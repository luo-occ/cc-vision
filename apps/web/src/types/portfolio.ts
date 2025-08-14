export interface CreateHoldingRequest {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  costBasis: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  exchange?: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  type: 'stock' | 'crypto';
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Holding[];
  lastUpdated: string;
}
