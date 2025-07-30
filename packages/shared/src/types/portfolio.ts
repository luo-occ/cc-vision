export interface Holding {
  id: string;
  symbol: string;           // e.g., "AAPL", "BTC"
  name: string;            // e.g., "Apple Inc.", "Bitcoin"
  type: 'stock' | 'crypto';
  quantity: number;        // Number of shares/coins owned
  costBasis: number;       // Average cost per share/coin
  currentPrice?: number;   // Latest price (updated hourly)
  lastUpdated?: Date;      // When price was last fetched
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSummary {
  totalValue: number;           // Current total portfolio value
  totalCost: number;           // Total amount invested
  totalGainLoss: number;       // Unrealized P&L
  totalGainLossPercent: number; // P&L percentage
  lastUpdated: Date;
  holdings: Holding[];
}

export interface CreateHoldingRequest {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  costBasis: number;
}

export interface UpdateHoldingRequest {
  quantity?: number;
  costBasis?: number;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  change24h?: number;
  changePercent24h?: number;
  lastUpdated: Date;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  exchange?: string;
}

export interface ChartData {
  timestamp: Date;
  price: number;
  volume?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}