import axios from 'axios';
import { AssetPrice } from '../types/shared';
import { createClient, RedisClientType } from 'redis';

class PriceService {
  private redis: RedisClientType;
  private alphaVantageKey: string;
  private coinGeckoKey?: string;

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.coinGeckoKey = process.env.COINGECKO_API_KEY;
    
    this.redis.connect().catch(console.error);
  }

  async getStockPrice(symbol: string): Promise<AssetPrice | null> {
    try {
      // Check Redis cache first
      const cached = await this.getCachedPrice(symbol);
      if (cached) return cached;

      // Fetch from Alpha Vantage
      const url = `https://www.alphavantage.co/query`;
      const params = {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: this.alphaVantageKey
      };

      const response = await axios.get(url, { params });
      const data = response.data['Global Quote'];

      if (!data || !data['05. price']) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const price: AssetPrice = {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data['05. price']),
        change24h: parseFloat(data['09. change']),
        changePercent24h: parseFloat(data['10. change percent'].replace('%', '')),
        lastUpdated: new Date()
      };

      // Cache for 5 minutes
      await this.cachePrice(symbol, price, 300);
      
      return price;
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return null;
    }
  }

  async getCryptoPrice(symbol: string): Promise<AssetPrice | null> {
    try {
      // Check Redis cache first
      const cached = await this.getCachedPrice(symbol);
      if (cached) return cached;

      // Map common symbols to CoinGecko IDs
      const coinGeckoId = this.mapSymbolToCoinGeckoId(symbol);
      
      const url = 'https://api.coingecko.com/api/v3/simple/price';
      const params: any = {
        ids: coinGeckoId,
        vs_currencies: 'usd',
        include_24hr_change: 'true'
      };

      if (this.coinGeckoKey) {
        params.x_cg_demo_api_key = this.coinGeckoKey;
      }

      const response = await axios.get(url, { params });
      const data = response.data[coinGeckoId];

      if (!data) {
        throw new Error(`No data found for crypto ${symbol}`);
      }

      const price: AssetPrice = {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        changePercent24h: data.usd_24h_change,
        lastUpdated: new Date()
      };

      // Cache for 5 minutes
      await this.cachePrice(symbol, price, 300);
      
      return price;
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      return null;
    }
  }

  async searchStocks(query: string): Promise<any[]> {
    try {
      const url = 'https://www.alphavantage.co/query';
      const params = {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: this.alphaVantageKey
      };

      const response = await axios.get(url, { params });
      const matches = response.data.bestMatches || [];

      return matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: 'stock',
        exchange: match['4. region']
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  async searchCrypto(query: string): Promise<any[]> {
    try {
      const url = 'https://api.coingecko.com/api/v3/search';
      const params: any = { query };

      if (this.coinGeckoKey) {
        params.x_cg_demo_api_key = this.coinGeckoKey;
      }

      const response = await axios.get(url, { params });
      const coins = response.data.coins || [];

      return coins.slice(0, 10).map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        type: 'crypto'
      }));
    } catch (error) {
      console.error('Error searching crypto:', error);
      return [];
    }
  }

  private async getCachedPrice(symbol: string): Promise<AssetPrice | null> {
    try {
      const cached = await this.redis.get(`price:${symbol.toUpperCase()}`);
      if (cached) {
        const price = JSON.parse(cached);
        price.lastUpdated = new Date(price.lastUpdated);
        return price;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached price:', error);
      return null;
    }
  }

  private async cachePrice(symbol: string, price: AssetPrice, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setEx(
        `price:${symbol.toUpperCase()}`,
        ttlSeconds,
        JSON.stringify(price)
      );
    } catch (error) {
      console.error('Error caching price:', error);
    }
  }

  private mapSymbolToCoinGeckoId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'LTC': 'litecoin',
      'XRP': 'ripple',
      'SOL': 'solana',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2'
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export default PriceService;