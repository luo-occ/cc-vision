export interface CreateHoldingRequest {
  accountId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  costBasis: number;
}

export interface Account {
  id: string;
  name: string;
  accountType: 'SECURITIES' | 'CRYPTO' | 'RETIREMENT' | 'SAVINGS' | 'CHECKING';
  currency: string;
  group?: string;
  isDefault: boolean;
  isActive: boolean;
  platformId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewAccount {
  name: string;
  accountType: 'SECURITIES' | 'CRYPTO' | 'RETIREMENT' | 'SAVINGS' | 'CHECKING';
  currency: string;
  group?: string;
  isDefault?: boolean;
  isActive?: boolean;
  platformId?: string;
}

export interface AccountUpdate {
  name?: string;
  accountType?: 'SECURITIES' | 'CRYPTO' | 'RETIREMENT' | 'SAVINGS' | 'CHECKING';
  currency?: string;
  group?: string;
  isDefault?: boolean;
  isActive?: boolean;
  platformId?: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  exchange?: string;
}

export interface Holding {
  id: string;
  accountId: string;
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
