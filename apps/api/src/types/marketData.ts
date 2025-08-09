export interface AssetPrice {
  symbol: string;
  price: number;
  change24h?: number;
  changePercent24h?: number;
  volume?: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface HistoricalPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface AssetSearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf' | 'mutual_fund';
  exchange?: string;
  currency?: string;
}

export interface MarketDataProvider {
  name: string;
  priority: number;
  enabled: boolean;
  
  getCurrentPrice(symbol: string, currency?: string): Promise<AssetPrice | null>;
  getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency?: string): Promise<HistoricalPrice[]>;
  searchAssets(query: string): Promise<AssetSearchResult[]>;
}

export interface MarketDataConfig {
  providers: {
    yahoo: {
      enabled: boolean;
      priority: number;
    };
    alphaVantage: {
      enabled: boolean;
      priority: number;
      apiKey?: string;
    };
    coinGecko: {
      enabled: boolean;
      priority: number;
      apiKey?: string;
    };
  };
  cache: {
    ttl: number;
  };
}

export interface MarketDataError {
  provider: string;
  symbol: string;
  error: string;
  timestamp: Date;
}