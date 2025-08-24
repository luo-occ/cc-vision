// Cloudflare KV Cache Service (replaces Redis)

export class KVCacheService {
  constructor(kv) {
    this.kv = kv;
  }

  // Price caching (replaces Redis price cache)
  async getCachedPrice(symbol) {
    const cacheKey = `price:${symbol.toUpperCase()}`;
    
    try {
      const cached = await this.kv.get(cacheKey, 'json');
      if (cached) {
        // Convert timestamp back to Date object
        cached.lastUpdated = new Date(cached.lastUpdated);
        return cached;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached price:', error);
      return null;
    }
  }

  async cachePrice(symbol, price, ttlSeconds = 300) { // Default 5 minutes
    const cacheKey = `price:${symbol.toUpperCase()}`;
    
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(price),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error('Error caching price:', error);
      return false;
    }
  }

  // Historical prices caching
  async getCachedHistoricalPrices(symbol, interval, range) {
    const cacheKey = `historical:${symbol.toUpperCase()}:${interval}:${range}`;
    
    try {
      const cached = await this.kv.get(cacheKey, 'json');
      return cached || [];
    } catch (error) {
      console.error('Error getting cached historical prices:', error);
      return [];
    }
  }

  async cacheHistoricalPrices(symbol, interval, range, prices, ttlSeconds = 3600) { // Default 1 hour
    const cacheKey = `historical:${symbol.toUpperCase()}:${interval}:${range}`;
    
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(prices),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error('Error caching historical prices:', error);
      return false;
    }
  }

  // Search results caching
  async getCachedSearchResults(query) {
    const cacheKey = `search:${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    try {
      const cached = await this.kv.get(cacheKey, 'json');
      return cached || [];
    } catch (error) {
      console.error('Error getting cached search results:', error);
      return [];
    }
  }

  async cacheSearchResults(query, results, ttlSeconds = 1800) { // Default 30 minutes
    const cacheKey = `search:${query.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(results),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error('Error caching search results:', error);
      return false;
    }
  }

  // Multiple prices caching (batch operations)
  async getCachedPrices(symbols) {
    const results = {};
    
    try {
      // KV doesn't have native batch get, so we do individual gets
      const promises = symbols.map(async (symbol) => {
        const price = await this.getCachedPrice(symbol);
        if (price) {
          results[symbol.toUpperCase()] = price;
        }
      });
      
      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error getting cached prices:', error);
      return {};
    }
  }

  async cachePrices(pricesMap, ttlSeconds = 300) {
    try {
      const promises = Object.entries(pricesMap).map(([symbol, price]) => 
        this.cachePrice(symbol, price, ttlSeconds)
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error caching prices:', error);
      return false;
    }
  }

  // Cache management
  async clearCache() {
    try {
      // KV doesn't have keys() or clear() like Redis
      // In production, you might want to implement a key tracking system
      // For now, we'll just log that cache clearing is not fully supported
      console.log('⚠️ KV cache clearing is limited. Consider setting shorter TTLs or using namespace versioning.');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Get cache statistics (limited compared to Redis)
  async getCacheStats() {
    try {
      // KV doesn't provide detailed stats like Redis
      // This is a placeholder for basic cache info
      return {
        provider: 'Cloudflare KV',
        status: 'active',
        timestamp: new Date().toISOString(),
        note: 'Detailed stats not available in KV'
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        provider: 'Cloudflare KV',
        status: 'error',
        error: error.message
      };
    }
  }

  // Generic cache methods
  async get(key) {
    try {
      return await this.kv.get(key, 'json');
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      await this.kv.put(
        key,
        JSON.stringify(value),
        ttlSeconds ? { expirationTtl: ttlSeconds } : {}
      );
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.kv.delete(key);
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const testKey = 'health_check_' + Date.now();
      const testValue = { timestamp: new Date().toISOString() };
      
      // Test write
      await this.set(testKey, testValue, 60); // 1 minute TTL
      
      // Test read
      const retrieved = await this.get(testKey);
      
      // Test delete
      await this.delete(testKey);
      
      return {
        status: 'healthy',
        writeTest: true,
        readTest: !!retrieved,
        deleteTest: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
