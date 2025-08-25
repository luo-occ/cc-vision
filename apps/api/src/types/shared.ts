// Shared types for the Portfolio API

export interface AccountTag {
  name: string;
  createdAt: Date;
}

export interface Account {
  id: string;
  name: string;
  group?: string;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  platformId?: string;
  tags: AccountTag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NewAccount {
  id?: string;
  name: string;
  group?: string;
  currency: string;
  isDefault?: boolean;
  isActive?: boolean;
  platformId?: string;
  tags?: string[];
}

export interface AccountUpdate {
  name?: string;
  group?: string;
  isDefault?: boolean;
  isActive?: boolean;
  platformId?: string;
  tags?: string[];
}

export interface Holding {
  id: string;
  accountId: string;
  symbol: string;
  name?: string;
  type: 'stock' | 'crypto' | 'etf' | 'mutual_fund' | 'bond' | 'cash';
  quantity: number;
  costBasis: number;
  currentPrice?: number;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHoldingRequest {
  accountId: string;
  symbol: string;
  name?: string;
  type: 'stock' | 'crypto' | 'etf' | 'mutual_fund' | 'bond' | 'cash';
  quantity: number;
  costBasis: number;
}

export interface UpdateHoldingRequest {
  quantity?: number;
  costBasis?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  lastUpdated: Date;
  holdings: Holding[];
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change24h?: number;
  changePercent24h?: number;
  volume?: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
