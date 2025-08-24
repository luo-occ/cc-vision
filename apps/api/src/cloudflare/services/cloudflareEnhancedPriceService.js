// Enhanced Price Service for Cloudflare Workers (using KV instead of Redis)

import { KVCacheService } from './kvCacheService.js';

export class CloudflareEnhancedPriceService {
  constructor(kv, env) {
    this.cache = new KVCacheService(kv);
    this.env = env;
    
    // API Keys from environment
    this.alphaVantageApiKey = env.ALPHA_VANTAGE_API_KEY;
    this.coinGeckoApiKey = env.COINGECKO_API_KEY;
    
    // Rate limiting
    this.lastAlphaVantageCall = 0;
    this.lastCoinGeckoCall = 0;
    this.alphaVantageDelay = 12000; // 12 seconds between calls (5 calls/minute)
    this.coinGeckoDelay = 1000; // 1 second between calls
  }

  // Get current price for a single asset
  async getCurrentPrice(symbol, assetType = 'STOCK') {
    const cacheKey = `price:${symbol.toUpperCase()}`;
    
    try {
      // Check cache first
      const cached = await this.cache.getCachedPrice(symbol);
      if (cached) {
        console.log(`📋 Cache hit for ${symbol}`);
        return cached;
      }

      console.log(`🌐 Fetching fresh price for ${symbol}`);
      
      // Fetch from appropriate provider
      let price;
      if (assetType === 'CRYPTO') {
        price = await this.fetchCryptoPrice(symbol);
      } else {
        price = await this.fetchStockPrice(symbol);
      }

      if (price) {
        // Cache for 5 minutes
        await this.cache.cachePrice(symbol, price, 300);
        return price;
      }

      return null;
    } catch (error) {
      console.error(`Error getting price for ${symbol}:`, error);
      return null;
    }
  }

  // Get current prices for multiple assets
  async getCurrentPrices(symbols) {
    try {
      // Check cache for all symbols first
      const cachedPrices = await this.cache.getCachedPrices(symbols);
      const uncachedSymbols = symbols.filter(symbol => !cachedPrices[symbol.toUpperCase()]);

      console.log(`📋 Cache hits: ${Object.keys(cachedPrices).length}, Cache misses: ${uncachedSymbols.length}`);

      // Fetch uncached prices
      const freshPrices = {};
      if (uncachedSymbols.length > 0) {
        const fetchPromises = uncachedSymbols.map(async (symbol) => {
          // Determine asset type (you might want to store this info)
          const assetType = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT') ? 'CRYPTO' : 'STOCK';
          const price = await this.getCurrentPrice(symbol, assetType);
          if (price) {
            freshPrices[symbol.toUpperCase()] = price;
          }
        });

        await Promise.all(fetchPromises);
      }

      // Combine cached and fresh prices
      return { ...cachedPrices, ...freshPrices };
    } catch (error) {
      console.error('Error getting current prices:', error);
      return {};
    }
  }

  // Get historical prices
  async getHistoricalPrices(symbol, interval = '1day', range = '30days') {
    try {
      // Check cache first
      const cached = await this.cache.getCachedHistoricalPrices(symbol, interval, range);
      if (cached.length > 0) {
        console.log(`📋 Historical cache hit for ${symbol}`);
        return cached;
      }

      console.log(`🌐 Fetching fresh historical data for ${symbol}`);
      
      // Fetch from API (simplified for demo)
      const prices = await this.fetchHistoricalPrices(symbol, interval, range);
      
      if (prices.length > 0) {
        // Cache for 1 hour
        await this.cache.cacheHistoricalPrices(symbol, interval, range, prices, 3600);
      }

      return prices;
    } catch (error) {
      console.error(`Error getting historical prices for ${symbol}:`, error);
      return [];
    }
  }

  // Search for assets
  async searchAssets(query) {
    try {
      // Check cache first
      const cached = await this.cache.getCachedSearchResults(query);
      if (cached.length > 0) {
        console.log(`📋 Search cache hit for "${query}"`);
        return cached;
      }

      console.log(`🌐 Fetching fresh search results for "${query}"`);
      
      // Fetch from API
      const results = await this.fetchSearchResults(query);
      
      if (results.length > 0) {
        // Cache for 30 minutes
        await this.cache.cacheSearchResults(query, results, 1800);
      }

      return results;
    } catch (error) {
      console.error(`Error searching for "${query}":`, error);
      return [];
    }
  }

  // Private methods for fetching data

  async fetchStockPrice(symbol) {
    try {
      await this.respectRateLimit('alphavantage');
      
      if (!this.alphaVantageApiKey) {
        console.warn('Alpha Vantage API key not provided');
        return this.getMockStockPrice(symbol);
      }

      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        const quote = data['Global Quote'];
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          lastUpdated: new Date(),
          source: 'Alpha Vantage',
          assetType: 'STOCK'
        };
      }

      return this.getMockStockPrice(symbol);
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return this.getMockStockPrice(symbol);
    }
  }

  async fetchCryptoPrice(symbol) {
    try {
      await this.respectRateLimit('coingecko');
      
      // Map common symbols to CoinGecko IDs
      const symbolMap = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDT': 'tether',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'ADA': 'cardano',
        'DOT': 'polkadot'
      };

      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      
      const headers = {};
      if (this.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data[coinId]) {
        const coinData = data[coinId];
        return {
          symbol: symbol.toUpperCase(),
          price: coinData.usd,
          change: coinData.usd_24h_change || 0,
          changePercent: coinData.usd_24h_change || 0,
          volume: coinData.usd_24h_vol || 0,
          lastUpdated: new Date(),
          source: 'CoinGecko',
          assetType: 'CRYPTO'
        };
      }

      return this.getMockCryptoPrice(symbol);
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      return this.getMockCryptoPrice(symbol);
    }
  }

  async fetchHistoricalPrices(symbol, interval, range) {
    // Simplified historical data fetching
    // In production, you'd call the appropriate API based on asset type
    try {
      const days = range === '30days' ? 30 : 7;
      const prices = [];
      const basePrice = 100; // Mock base price
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate mock price with some variation
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const price = basePrice * (1 + variation);
        
        prices.push({
          date: date.toISOString().split('T')[0],
          open: price * 0.99,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: Math.floor(Math.random() * 1000000)
        });
      }
      
      return prices;
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  }

  async fetchSearchResults(query) {
    // Simplified search - in production you'd call real APIs
    const mockResults = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'STOCK',
        exchange: 'NASDAQ'
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'CRYPTO',
        exchange: 'Cryptocurrency'
      }
    ].filter(item => 
      item.symbol.toLowerCase().includes(query.toLowerCase()) ||
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    return mockResults;
  }

  // Rate limiting helpers
  async respectRateLimit(provider) {
    const now = Date.now();
    
    if (provider === 'alphavantage') {
      const timeSinceLastCall = now - this.lastAlphaVantageCall;
      if (timeSinceLastCall < this.alphaVantageDelay) {
        const waitTime = this.alphaVantageDelay - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastAlphaVantageCall = Date.now();
    } else if (provider === 'coingecko') {
      const timeSinceLastCall = now - this.lastCoinGeckoCall;
      if (timeSinceLastCall < this.coinGeckoDelay) {
        const waitTime = this.coinGeckoDelay - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastCoinGeckoCall = Date.now();
    }
  }

  // Mock data generators
  getMockStockPrice(symbol) {
    const basePrice = 100 + Math.random() * 400; // $100-500
    const change = (Math.random() - 0.5) * 10; // ±$5
    
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      lastUpdated: new Date(),
      source: 'Mock Data',
      assetType: 'STOCK'
    };
  }

  getMockCryptoPrice(symbol) {
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3000 : 1;
    const change = (Math.random() - 0.5) * basePrice * 0.1; // ±10%
    
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      lastUpdated: new Date(),
      source: 'Mock Data',
      assetType: 'CRYPTO'
    };
  }

  // Cache management
  async clearCache() {
    return await this.cache.clearCache();
  }

  async getCacheStats() {
    return await this.cache.getCacheStats();
  }

  // Health check
  async healthCheck() {
    const cacheHealth = await this.cache.healthCheck();
    
    return {
      status: 'healthy',
      cache: cacheHealth,
      providers: {
        alphaVantage: !!this.alphaVantageApiKey,
        coinGecko: !!this.coinGeckoApiKey
      },
      timestamp: new Date().toISOString()
    };
  }
}
