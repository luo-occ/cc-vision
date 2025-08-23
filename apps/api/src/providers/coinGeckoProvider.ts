import axios from 'axios';
import { AssetPrice, HistoricalPrice, AssetSearchResult, MarketDataProvider } from '../types/marketData';

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  };
}

interface CoinGeckoSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
}

interface CoinGeckoHistoricalResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export class CoinGeckoProvider implements MarketDataProvider {
  name = 'CoinGecko';
  priority = 3;
  enabled: boolean;
  private apiKey?: string;
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private lastCallTime = 0;
  private readonly minCallInterval = 1000; // 1 second between calls for free tier

  // Common cryptocurrency mappings
  private readonly symbolToIdMap: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'LTC': 'litecoin',
    'XRP': 'ripple',
    'SOL': 'solana',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'UNI': 'uniswap',
    'ATOM': 'cosmos',
    'DOGE': 'dogecoin',
    'SHIB': 'shiba-inu',
    'DAI': 'dai',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BUSD': 'binance-usd',
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.enabled = true; // CoinGecko free tier is always available
  }

  async getCurrentPrice(symbol: string, currency: string = 'USD'): Promise<AssetPrice | null> {
    if (!this.enabled) return null;
    
    try {
      await this.rateLimit();
      
      const coinId = this.getCoinId(symbol);
      if (!coinId) return null;

      const params: any = {
        ids: coinId,
        vs_currencies: 'usd',
        include_24hr_change: 'true',
        include_24hr_vol: 'true',
        include_market_cap: 'true',
      };

      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey;
      }

      const response = await axios.get<CoinGeckoPriceResponse>(
        `${this.baseUrl}/simple/price`,
        { params, timeout: 10000 }
      );

      const data = response.data[coinId];
      if (!data || !data.usd) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        changePercent24h: data.usd_24h_change,
        volume: data.usd_24h_vol,
        marketCap: data.usd_market_cap,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`CoinGecko error for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency: string = 'USD'): Promise<HistoricalPrice[]> {
    if (!this.enabled) return [];
    
    try {
      await this.rateLimit();
      
      const coinId = this.getCoinId(symbol);
      if (!coinId) return [];

      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const params: any = {
        vs_currency: 'usd',
        from: startTimestamp,
        to: endTimestamp,
      };

      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey;
      }

      const response = await axios.get<CoinGeckoHistoricalResponse>(
        `${this.baseUrl}/coins/${coinId}/market_chart/range`,
        { params, timeout: 15000 }
      );

      const prices = response.data.prices || [];
      const volumes = response.data.total_volumes || [];
      
      const historicalPrices: HistoricalPrice[] = prices.map((price, index) => {
        const timestamp = price[0];
        const date = new Date(timestamp);
        const priceValue = price[1];
        const volume = volumes[index]?.[1] || 0;

        return {
          symbol,
          date: date.toISOString().split('T')[0],
          open: priceValue,
          high: priceValue,
          low: priceValue,
          close: priceValue,
          volume,
        };
      });

      // Group by date and calculate OHLC
      return this.groupByDate(historicalPrices);
    } catch (error) {
      console.error(`CoinGecko historical error for ${symbol}:`, error);
      return [];
    }
  }

  async searchAssets(query: string): Promise<AssetSearchResult[]> {
    if (!this.enabled) return [];
    
    try {
      await this.rateLimit();
      
      const params: any = { query };
      
      if (this.apiKey) {
        params.x_cg_demo_api_key = this.apiKey;
      }

      const response = await axios.get<{ coins: CoinGeckoSearchResult[] }>(
        `${this.baseUrl}/search`,
        { params, timeout: 10000 }
      );

      return response.data.coins
        .slice(0, 10)
        .map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          type: 'crypto' as const,
          currency: 'USD',
        }));
    } catch (error) {
      console.error('CoinGecko search error:', error);
      return [];
    }
  }

  private getCoinId(symbol: string): string | null {
    const upperSymbol = symbol.toUpperCase();
    return this.symbolToIdMap[upperSymbol] || upperSymbol.toLowerCase();
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minCallInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minCallInterval - timeSinceLastCall));
    }
    
    this.lastCallTime = Date.now();
  }

  private groupByDate(prices: HistoricalPrice[]): HistoricalPrice[] {
    const grouped: { [date: string]: HistoricalPrice[] } = {};
    
    prices.forEach(price => {
      if (!grouped[price.date]) {
        grouped[price.date] = [];
      }
      grouped[price.date].push(price);
    });

    return Object.entries(grouped).map(([date, dayPrices]) => {
      const open = dayPrices[0].open;
      const close = dayPrices[dayPrices.length - 1].close;
      const high = Math.max(...dayPrices.map(p => p.high));
      const low = Math.min(...dayPrices.map(p => p.low));
      const volume = dayPrices.reduce((sum, p) => sum + (p.volume || 0), 0);

      return {
        symbol: dayPrices[0].symbol,
        date,
        open,
        high,
        low,
        close,
        volume,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  updateApiKey(apiKey?: string): void {
    this.apiKey = apiKey;
  }
}