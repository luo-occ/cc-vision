import { MarketDataRegistry } from './marketDataRegistry';
import { AssetPrice, HistoricalPrice, AssetSearchResult, MarketDataConfig } from '../types/marketData';
import { createClient, RedisClientType } from 'redis';

class EnhancedPriceService {
  private registry: MarketDataRegistry;
  private redis: RedisClientType;
  private config: MarketDataConfig;

  constructor(config?: Partial<MarketDataConfig>) {
    this.config = this.mergeConfig(config);
    this.registry = new MarketDataRegistry();
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redis.connect().catch(console.error);
  }

  private mergeConfig(config?: Partial<MarketDataConfig>): MarketDataConfig {
    const defaultConfig: MarketDataConfig = {
      providers: {
        yahoo: {
          enabled: true,
          priority: 1,
        },
        alphaVantage: {
          enabled: !!process.env.ALPHA_VANTAGE_API_KEY,
          priority: 2,
          apiKey: process.env.ALPHA_VANTAGE_API_KEY,
        },
        coinGecko: {
          enabled: true,
          priority: 3,
          apiKey: process.env.COINGECKO_API_KEY,
        },
      },
      cache: {
        ttl: 300, // 5 minutes default
      },
    };

    return {
      providers: {
        ...defaultConfig.providers,
        ...config?.providers,
      },
      cache: {
        ...defaultConfig.cache,
        ...config?.cache,
      },
    };
  }

  async getCurrentPrice(symbol: string, currency: string = 'USD', forceRefresh: boolean = false): Promise<AssetPrice | null> {
    const cacheKey = `price:${symbol.toUpperCase()}:${currency.toUpperCase()}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await this.getCachedPrice(cacheKey);
      if (cached) return cached;
    }

    // Fetch from providers
    const price = await this.registry.getCurrentPrice(symbol, currency);
    
    if (price) {
      // Cache the result
      await this.cachePrice(cacheKey, price, this.config.cache.ttl);
    }

    return price;
  }

  async getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency: string = 'USD', forceRefresh: boolean = false): Promise<HistoricalPrice[]> {
    const cacheKey = `historical:${symbol.toUpperCase()}:${currency.toUpperCase()}:${startDate.toISOString()}:${endDate.toISOString()}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await this.getCachedHistoricalPrices(cacheKey);
      if (cached.length > 0) return cached;
    }

    // Fetch from providers
    const prices = await this.registry.getHistoricalPrices(symbol, startDate, endDate, currency);
    
    if (prices.length > 0) {
      // Cache the result
      await this.cacheHistoricalPrices(cacheKey, prices, this.config.cache.ttl * 2); // Cache historical data longer
    }

    return prices;
  }

  async searchAssets(query: string, forceRefresh: boolean = false): Promise<AssetSearchResult[]> {
    const cacheKey = `search:${query.toLowerCase()}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await this.getCachedSearchResults(cacheKey);
      if (cached.length > 0) return cached;
    }

    // Fetch from providers
    const results = await this.registry.searchAssets(query);
    
    if (results.length > 0) {
      // Cache the result
      await this.cacheSearchResults(cacheKey, results, this.config.cache.ttl / 2); // Cache search results shorter
    }

    return results;
  }

  async getBatchPrices(symbols: string[], currency: string = 'USD', forceRefresh: boolean = false): Promise<Map<string, AssetPrice>> {
    const results = new Map<string, AssetPrice>();
    const uncachedSymbols: string[] = [];

    // Check cache first
    if (!forceRefresh) {
      for (const symbol of symbols) {
        const cacheKey = `price:${symbol.toUpperCase()}:${currency.toUpperCase()}`;
        const cached = await this.getCachedPrice(cacheKey);
        if (cached) {
          results.set(symbol, cached);
        } else {
          uncachedSymbols.push(symbol);
        }
      }
    } else {
      uncachedSymbols.push(...symbols);
    }

    // Fetch uncached symbols
    if (uncachedSymbols.length > 0) {
      const fetchedPrices = await this.registry.getBatchPrices(uncachedSymbols, currency);
      
      // Cache and add to results
      for (const [symbol, price] of fetchedPrices) {
        const cacheKey = `price:${symbol.toUpperCase()}:${currency.toUpperCase()}`;
        await this.cachePrice(cacheKey, price, this.config.cache.ttl);
        results.set(symbol, price);
      }
    }

    return results;
  }

  async refreshPrices(symbols: string[], currency: string = 'USD'): Promise<Map<string, AssetPrice>> {
    return this.getBatchPrices(symbols, currency, true);
  }

  // Configuration management
  updateConfig(config: Partial<MarketDataConfig>): void {
    this.config = this.mergeConfig(config);
    
    // Update provider configurations
    if (config.providers?.alphaVantage?.enabled !== undefined) {
      this.registry.updateProviderConfig('Alpha Vantage', {
        enabled: config.providers.alphaVantage.enabled,
        apiKey: config.providers.alphaVantage.apiKey,
      });
    }

    if (config.providers?.coinGecko?.enabled !== undefined) {
      this.registry.updateProviderConfig('CoinGecko', {
        enabled: config.providers.coinGecko.enabled,
        apiKey: config.providers.coinGecko.apiKey,
      });
    }
  }

  getProviderStatus() {
    return this.registry.getProviderStatus();
  }

  getRecentErrors() {
    return this.registry.getRecentErrors();
  }

  // Cache management
  private async getCachedPrice(cacheKey: string): Promise<AssetPrice | null> {
    try {
      const cached = await this.redis.get(cacheKey);
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

  private async cachePrice(cacheKey: string, price: AssetPrice, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setEx(cacheKey, ttlSeconds, JSON.stringify(price));
    } catch (error) {
      console.error('Error caching price:', error);
    }
  }

  private async getCachedHistoricalPrices(cacheKey: string): Promise<HistoricalPrice[]> {
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting cached historical prices:', error);
      return [];
    }
  }

  private async cacheHistoricalPrices(cacheKey: string, prices: HistoricalPrice[], ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setEx(cacheKey, ttlSeconds, JSON.stringify(prices));
    } catch (error) {
      console.error('Error caching historical prices:', error);
    }
  }

  private async getCachedSearchResults(cacheKey: string): Promise<AssetSearchResult[]> {
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting cached search results:', error);
      return [];
    }
  }

  private async cacheSearchResults(cacheKey: string, results: AssetSearchResult[], ttlSeconds: number): Promise<void> {
    try {
      await this.redis.setEx(cacheKey, ttlSeconds, JSON.stringify(results));
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Clear all market data related cache keys
      const keys = await this.redis.keys('price:*');
      const historicalKeys = await this.redis.keys('historical:*');
      const searchKeys = await this.redis.keys('search:*');
      
      const allKeys = [...keys, ...historicalKeys, ...searchKeys];
      
      if (allKeys.length > 0) {
        await this.redis.del(allKeys);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export default EnhancedPriceService;