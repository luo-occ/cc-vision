var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-s9MFna/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/handlers/health.js
async function healthHandler(request, env) {
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders2
        }
      }
    );
  }
  return new Response(
    JSON.stringify({
      status: "OK (Cloudflare Workers)",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      message: "Portfolio API is running on Cloudflare Workers",
      region: request.cf?.colo || "unknown",
      country: request.cf?.country || "unknown"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders2
      }
    }
  );
}
__name(healthHandler, "healthHandler");

// src/cloudflare/models/d1Database.js
var D1Database = class {
  static {
    __name(this, "D1Database");
  }
  constructor(db) {
    this.db = db;
  }
  // Initialize database tables
  async initializeTables() {
    const statements = [
      // Accounts table
      `CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        is_default INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      // Holdings table
      `CREATE TABLE IF NOT EXISTS holdings (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        quantity REAL NOT NULL,
        average_price REAL NOT NULL,
        asset_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
      )`,
      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id)`,
      `CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol)`,
      `CREATE INDEX IF NOT EXISTS idx_accounts_default ON accounts(is_default)`
    ];
    try {
      for (const sql of statements) {
        await this.db.prepare(sql).run();
      }
      console.log("\u2705 D1 Database tables initialized successfully");
    } catch (error) {
      console.error("\u274C Error initializing D1 tables:", error);
      throw error;
    }
  }
  // Account operations
  async createAccount(account) {
    const sql = `
      INSERT INTO accounts (id, name, account_type, currency, is_default, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      const result = await this.db.prepare(sql).bind(
        account.id,
        account.name,
        account.accountType,
        account.currency || "USD",
        account.isDefault ? 1 : 0,
        account.isActive ? 1 : 0
      ).run();
      return result.success;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  }
  async getAccounts() {
    const sql = `
      SELECT id, name, account_type, currency, is_default, is_active, created_at, updated_at
      FROM accounts 
      WHERE is_active = 1
      ORDER BY is_default DESC, name ASC
    `;
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map((account) => ({
        id: account.id,
        name: account.name,
        accountType: account.account_type,
        currency: account.currency,
        isDefault: account.is_default === 1,
        isActive: account.is_active === 1,
        createdAt: account.created_at,
        updatedAt: account.updated_at
      }));
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw error;
    }
  }
  async getAccountById(id) {
    const sql = `
      SELECT id, name, account_type, currency, is_default, is_active, created_at, updated_at
      FROM accounts 
      WHERE id = ? AND is_active = 1
    `;
    try {
      const result = await this.db.prepare(sql).bind(id).first();
      if (!result) return null;
      return {
        id: result.id,
        name: result.name,
        accountType: result.account_type,
        currency: result.currency,
        isDefault: result.is_default === 1,
        isActive: result.is_active === 1,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error("Error getting account by ID:", error);
      throw error;
    }
  }
  // Holdings operations
  async createHolding(holding) {
    const sql = `
      INSERT INTO holdings (id, account_id, symbol, quantity, average_price, asset_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
      const result = await this.db.prepare(sql).bind(
        holding.id,
        holding.accountId,
        holding.symbol.toUpperCase(),
        holding.quantity,
        holding.averagePrice,
        holding.assetType
      ).run();
      return result.success;
    } catch (error) {
      console.error("Error creating holding:", error);
      throw error;
    }
  }
  async getHoldingsByAccountId(accountId) {
    const sql = `
      SELECT id, account_id, symbol, quantity, average_price, asset_type, created_at, updated_at
      FROM holdings 
      WHERE account_id = ?
      ORDER BY symbol ASC
    `;
    try {
      const result = await this.db.prepare(sql).bind(accountId).all();
      return result.results.map((holding) => ({
        id: holding.id,
        accountId: holding.account_id,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.average_price,
        assetType: holding.asset_type,
        createdAt: holding.created_at,
        updatedAt: holding.updated_at
      }));
    } catch (error) {
      console.error("Error getting holdings by account ID:", error);
      throw error;
    }
  }
  async getAllHoldings() {
    const sql = `
      SELECT h.id, h.account_id, h.symbol, h.quantity, h.average_price, h.asset_type, 
             h.created_at, h.updated_at, a.name as account_name
      FROM holdings h
      JOIN accounts a ON h.account_id = a.id
      WHERE a.is_active = 1
      ORDER BY a.name ASC, h.symbol ASC
    `;
    try {
      const result = await this.db.prepare(sql).all();
      return result.results.map((holding) => ({
        id: holding.id,
        accountId: holding.account_id,
        accountName: holding.account_name,
        symbol: holding.symbol,
        quantity: holding.quantity,
        averagePrice: holding.average_price,
        assetType: holding.asset_type,
        createdAt: holding.created_at,
        updatedAt: holding.updated_at
      }));
    } catch (error) {
      console.error("Error getting all holdings:", error);
      throw error;
    }
  }
  async updateHolding(id, updates) {
    const fields = [];
    const values = [];
    if (updates.quantity !== void 0) {
      fields.push("quantity = ?");
      values.push(updates.quantity);
    }
    if (updates.averagePrice !== void 0) {
      fields.push("average_price = ?");
      values.push(updates.averagePrice);
    }
    if (fields.length === 0) return false;
    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const sql = `UPDATE holdings SET ${fields.join(", ")} WHERE id = ?`;
    try {
      const result = await this.db.prepare(sql).bind(...values).run();
      return result.success;
    } catch (error) {
      console.error("Error updating holding:", error);
      throw error;
    }
  }
  async deleteHolding(id) {
    const sql = `DELETE FROM holdings WHERE id = ?`;
    try {
      const result = await this.db.prepare(sql).bind(id).run();
      return result.success;
    } catch (error) {
      console.error("Error deleting holding:", error);
      throw error;
    }
  }
  // Utility methods
  async ensureDefaultAccount() {
    const accounts = await this.getAccounts();
    const defaultAccount = accounts.find((acc) => acc.isDefault);
    if (!defaultAccount) {
      const defaultAccountData = {
        id: "default-account-" + Date.now(),
        name: "Default Account",
        accountType: "SECURITIES",
        currency: "USD",
        isDefault: true,
        isActive: true
      };
      await this.createAccount(defaultAccountData);
      console.log("\u2705 Default account created");
      return defaultAccountData;
    }
    return defaultAccount;
  }
};

// src/handlers/accounts.js
async function accountsHandler(request, env) {
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    const database = new D1Database(env.DB);
    if (request.method === "GET") {
      const accounts = await database.getAccounts();
      return new Response(
        JSON.stringify({
          success: true,
          data: accounts,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "Cloudflare D1"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders2
          }
        }
      );
    }
    if (request.method === "POST") {
      const accountData = await request.json();
      if (!accountData.name || !accountData.accountType) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: name, accountType"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      }
      if (!accountData.id) {
        accountData.id = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      accountData.currency = accountData.currency || "USD";
      accountData.isDefault = accountData.isDefault || false;
      accountData.isActive = accountData.isActive !== false;
      const success = await database.createAccount(accountData);
      if (success) {
        const createdAccount = await database.getAccountById(accountData.id);
        return new Response(
          JSON.stringify({
            success: true,
            data: createdAccount,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "Cloudflare D1"
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      }
    }
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders2
        }
      }
    );
  } catch (error) {
    console.error("Error in accounts handler:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders2
        }
      }
    );
  }
}
__name(accountsHandler, "accountsHandler");

// src/cloudflare/services/kvCacheService.js
var KVCacheService = class {
  static {
    __name(this, "KVCacheService");
  }
  constructor(kv) {
    this.kv = kv;
  }
  // Price caching (replaces Redis price cache)
  async getCachedPrice(symbol) {
    const cacheKey = `price:${symbol.toUpperCase()}`;
    try {
      const cached = await this.kv.get(cacheKey, "json");
      if (cached) {
        cached.lastUpdated = new Date(cached.lastUpdated);
        return cached;
      }
      return null;
    } catch (error) {
      console.error("Error getting cached price:", error);
      return null;
    }
  }
  async cachePrice(symbol, price, ttlSeconds = 300) {
    const cacheKey = `price:${symbol.toUpperCase()}`;
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(price),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error("Error caching price:", error);
      return false;
    }
  }
  // Historical prices caching
  async getCachedHistoricalPrices(symbol, interval, range) {
    const cacheKey = `historical:${symbol.toUpperCase()}:${interval}:${range}`;
    try {
      const cached = await this.kv.get(cacheKey, "json");
      return cached || [];
    } catch (error) {
      console.error("Error getting cached historical prices:", error);
      return [];
    }
  }
  async cacheHistoricalPrices(symbol, interval, range, prices, ttlSeconds = 3600) {
    const cacheKey = `historical:${symbol.toUpperCase()}:${interval}:${range}`;
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(prices),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error("Error caching historical prices:", error);
      return false;
    }
  }
  // Search results caching
  async getCachedSearchResults(query) {
    const cacheKey = `search:${query.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    try {
      const cached = await this.kv.get(cacheKey, "json");
      return cached || [];
    } catch (error) {
      console.error("Error getting cached search results:", error);
      return [];
    }
  }
  async cacheSearchResults(query, results, ttlSeconds = 1800) {
    const cacheKey = `search:${query.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    try {
      await this.kv.put(
        cacheKey,
        JSON.stringify(results),
        { expirationTtl: ttlSeconds }
      );
      return true;
    } catch (error) {
      console.error("Error caching search results:", error);
      return false;
    }
  }
  // Multiple prices caching (batch operations)
  async getCachedPrices(symbols) {
    const results = {};
    try {
      const promises = symbols.map(async (symbol) => {
        const price = await this.getCachedPrice(symbol);
        if (price) {
          results[symbol.toUpperCase()] = price;
        }
      });
      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("Error getting cached prices:", error);
      return {};
    }
  }
  async cachePrices(pricesMap, ttlSeconds = 300) {
    try {
      const promises = Object.entries(pricesMap).map(
        ([symbol, price]) => this.cachePrice(symbol, price, ttlSeconds)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error caching prices:", error);
      return false;
    }
  }
  // Cache management
  async clearCache() {
    try {
      console.log("\u26A0\uFE0F KV cache clearing is limited. Consider setting shorter TTLs or using namespace versioning.");
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
  // Get cache statistics (limited compared to Redis)
  async getCacheStats() {
    try {
      return {
        provider: "Cloudflare KV",
        status: "active",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        note: "Detailed stats not available in KV"
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        provider: "Cloudflare KV",
        status: "error",
        error: error.message
      };
    }
  }
  // Generic cache methods
  async get(key) {
    try {
      return await this.kv.get(key, "json");
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
      const testKey = "health_check_" + Date.now();
      const testValue = { timestamp: (/* @__PURE__ */ new Date()).toISOString() };
      await this.set(testKey, testValue, 60);
      const retrieved = await this.get(testKey);
      await this.delete(testKey);
      return {
        status: "healthy",
        writeTest: true,
        readTest: !!retrieved,
        deleteTest: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
};

// src/cloudflare/services/cloudflareEnhancedPriceService.js
var CloudflareEnhancedPriceService = class {
  static {
    __name(this, "CloudflareEnhancedPriceService");
  }
  constructor(kv, env) {
    this.cache = new KVCacheService(kv);
    this.env = env;
    this.alphaVantageApiKey = env.ALPHA_VANTAGE_API_KEY;
    this.coinGeckoApiKey = env.COINGECKO_API_KEY;
    this.lastAlphaVantageCall = 0;
    this.lastCoinGeckoCall = 0;
    this.alphaVantageDelay = 12e3;
    this.coinGeckoDelay = 1e3;
  }
  // Get current price for a single asset
  async getCurrentPrice(symbol, assetType = "STOCK") {
    const cacheKey = `price:${symbol.toUpperCase()}`;
    try {
      const cached = await this.cache.getCachedPrice(symbol);
      if (cached) {
        console.log(`\u{1F4CB} Cache hit for ${symbol}`);
        return cached;
      }
      console.log(`\u{1F310} Fetching fresh price for ${symbol}`);
      let price;
      if (assetType === "CRYPTO") {
        price = await this.fetchCryptoPrice(symbol);
      } else {
        price = await this.fetchStockPrice(symbol);
      }
      if (price) {
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
      const cachedPrices = await this.cache.getCachedPrices(symbols);
      const uncachedSymbols = symbols.filter((symbol) => !cachedPrices[symbol.toUpperCase()]);
      console.log(`\u{1F4CB} Cache hits: ${Object.keys(cachedPrices).length}, Cache misses: ${uncachedSymbols.length}`);
      const freshPrices = {};
      if (uncachedSymbols.length > 0) {
        const fetchPromises = uncachedSymbols.map(async (symbol) => {
          const assetType = symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("USDT") ? "CRYPTO" : "STOCK";
          const price = await this.getCurrentPrice(symbol, assetType);
          if (price) {
            freshPrices[symbol.toUpperCase()] = price;
          }
        });
        await Promise.all(fetchPromises);
      }
      return { ...cachedPrices, ...freshPrices };
    } catch (error) {
      console.error("Error getting current prices:", error);
      return {};
    }
  }
  // Get historical prices
  async getHistoricalPrices(symbol, interval = "1day", range = "30days") {
    try {
      const cached = await this.cache.getCachedHistoricalPrices(symbol, interval, range);
      if (cached.length > 0) {
        console.log(`\u{1F4CB} Historical cache hit for ${symbol}`);
        return cached;
      }
      console.log(`\u{1F310} Fetching fresh historical data for ${symbol}`);
      const prices = await this.fetchHistoricalPrices(symbol, interval, range);
      if (prices.length > 0) {
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
      const cached = await this.cache.getCachedSearchResults(query);
      if (cached.length > 0) {
        console.log(`\u{1F4CB} Search cache hit for "${query}"`);
        return cached;
      }
      console.log(`\u{1F310} Fetching fresh search results for "${query}"`);
      const results = await this.fetchSearchResults(query);
      if (results.length > 0) {
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
      await this.respectRateLimit("alphavantage");
      if (!this.alphaVantageApiKey) {
        console.warn("Alpha Vantage API key not provided");
        return this.getMockStockPrice(symbol);
      }
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
        const quote = data["Global Quote"];
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(quote["05. price"]),
          change: parseFloat(quote["09. change"]),
          changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
          volume: parseInt(quote["06. volume"]),
          lastUpdated: /* @__PURE__ */ new Date(),
          source: "Alpha Vantage",
          assetType: "STOCK"
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
      await this.respectRateLimit("coingecko");
      const symbolMap = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "USDT": "tether",
        "BNB": "binancecoin",
        "SOL": "solana",
        "ADA": "cardano",
        "DOT": "polkadot"
      };
      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      const headers = {};
      if (this.coinGeckoApiKey) {
        headers["x-cg-demo-api-key"] = this.coinGeckoApiKey;
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
          lastUpdated: /* @__PURE__ */ new Date(),
          source: "CoinGecko",
          assetType: "CRYPTO"
        };
      }
      return this.getMockCryptoPrice(symbol);
    } catch (error) {
      console.error(`Error fetching crypto price for ${symbol}:`, error);
      return this.getMockCryptoPrice(symbol);
    }
  }
  async fetchHistoricalPrices(symbol, interval, range) {
    try {
      const days = range === "30days" ? 30 : 7;
      const prices = [];
      const basePrice = 100;
      for (let i = days; i >= 0; i--) {
        const date = /* @__PURE__ */ new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + variation);
        prices.push({
          date: date.toISOString().split("T")[0],
          open: price * 0.99,
          high: price * 1.02,
          low: price * 0.98,
          close: price,
          volume: Math.floor(Math.random() * 1e6)
        });
      }
      return prices;
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  }
  async fetchSearchResults(query) {
    const mockResults = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        type: "STOCK",
        exchange: "NASDAQ"
      },
      {
        symbol: "BTC",
        name: "Bitcoin",
        type: "CRYPTO",
        exchange: "Cryptocurrency"
      }
    ].filter(
      (item) => item.symbol.toLowerCase().includes(query.toLowerCase()) || item.name.toLowerCase().includes(query.toLowerCase())
    );
    return mockResults;
  }
  // Rate limiting helpers
  async respectRateLimit(provider) {
    const now = Date.now();
    if (provider === "alphavantage") {
      const timeSinceLastCall = now - this.lastAlphaVantageCall;
      if (timeSinceLastCall < this.alphaVantageDelay) {
        const waitTime = this.alphaVantageDelay - timeSinceLastCall;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.lastAlphaVantageCall = Date.now();
    } else if (provider === "coingecko") {
      const timeSinceLastCall = now - this.lastCoinGeckoCall;
      if (timeSinceLastCall < this.coinGeckoDelay) {
        const waitTime = this.coinGeckoDelay - timeSinceLastCall;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.lastCoinGeckoCall = Date.now();
    }
  }
  // Mock data generators
  getMockStockPrice(symbol) {
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 1e7),
      lastUpdated: /* @__PURE__ */ new Date(),
      source: "Mock Data",
      assetType: "STOCK"
    };
  }
  getMockCryptoPrice(symbol) {
    const basePrice = symbol === "BTC" ? 45e3 : symbol === "ETH" ? 3e3 : 1;
    const change = (Math.random() - 0.5) * basePrice * 0.1;
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 1e6),
      lastUpdated: /* @__PURE__ */ new Date(),
      source: "Mock Data",
      assetType: "CRYPTO"
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
      status: "healthy",
      cache: cacheHealth,
      providers: {
        alphaVantage: !!this.alphaVantageApiKey,
        coinGecko: !!this.coinGeckoApiKey
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// src/handlers/portfolio.js
async function portfolioHandler(request, env) {
  const corsHeaders2 = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  try {
    const database = new D1Database(env.DB);
    const priceService = new CloudflareEnhancedPriceService(env.PORTFOLIO_KV, env);
    if (request.method === "GET") {
      const url = new URL(request.url);
      const accountId = url.searchParams.get("accountId");
      let holdings;
      if (accountId) {
        holdings = await database.getHoldingsByAccountId(accountId);
      } else {
        holdings = await database.getAllHoldings();
      }
      if (holdings.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              summary: {
                totalValue: 0,
                totalGainLoss: 0,
                totalGainLossPercent: 0,
                currency: "USD"
              },
              holdings: [],
              lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
            },
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "Cloudflare D1 + KV"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      }
      const symbols = holdings.map((h) => h.symbol);
      const currentPrices = await priceService.getCurrentPrices(symbols);
      let totalValue = 0;
      let totalCost = 0;
      const enrichedHoldings = holdings.map((holding) => {
        const currentPrice = currentPrices[holding.symbol.toUpperCase()];
        const price = currentPrice ? currentPrice.price : holding.averagePrice;
        const marketValue = holding.quantity * price;
        const cost = holding.quantity * holding.averagePrice;
        const gainLoss = marketValue - cost;
        const gainLossPercent = cost > 0 ? gainLoss / cost * 100 : 0;
        totalValue += marketValue;
        totalCost += cost;
        return {
          id: holding.id,
          accountId: holding.accountId,
          accountName: holding.accountName,
          symbol: holding.symbol,
          name: currentPrice?.name || holding.symbol,
          quantity: holding.quantity,
          averagePrice: holding.averagePrice,
          currentPrice: price,
          marketValue: parseFloat(marketValue.toFixed(2)),
          gainLoss: parseFloat(gainLoss.toFixed(2)),
          gainLossPercent: parseFloat(gainLossPercent.toFixed(2)),
          assetType: holding.assetType,
          lastUpdated: currentPrice?.lastUpdated || holding.updatedAt,
          priceSource: currentPrice?.source || "No current price"
        };
      });
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? totalGainLoss / totalCost * 100 : 0;
      const portfolio = {
        summary: {
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          totalGainLoss: parseFloat(totalGainLoss.toFixed(2)),
          totalGainLossPercent: parseFloat(totalGainLossPercent.toFixed(2)),
          currency: "USD",
          holdingsCount: holdings.length
        },
        holdings: enrichedHoldings,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      return new Response(
        JSON.stringify({
          success: true,
          data: portfolio,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "Cloudflare D1 + KV"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders2
          }
        }
      );
    }
    if (request.method === "POST") {
      const holdingData = await request.json();
      if (!holdingData.accountId || !holdingData.symbol || !holdingData.quantity || !holdingData.averagePrice) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: accountId, symbol, quantity, averagePrice"
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      }
      if (!holdingData.id) {
        holdingData.id = `holding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      holdingData.assetType = holdingData.assetType || "STOCK";
      const success = await database.createHolding(holdingData);
      if (success) {
        return new Response(
          JSON.stringify({
            success: true,
            data: holdingData,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "Cloudflare D1"
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to create holding" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders2
            }
          }
        );
      }
    }
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders2
        }
      }
    );
  } catch (error) {
    console.error("Error in portfolio handler:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders2
        }
      }
    );
  }
}
__name(portfolioHandler, "portfolioHandler");

// src/worker.js
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
function createResponse(data, status = 200, headers = {}) {
  return new Response(
    typeof data === "string" ? data : JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
        ...headers
      }
    }
  );
}
__name(createResponse, "createResponse");
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}
__name(handleOptions, "handleOptions");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return handleOptions();
    }
    try {
      if (env.DB) {
        const database = new D1Database(env.DB);
        ctx.waitUntil(Promise.resolve().then(async () => {
          try {
            await database.initializeTables();
            await database.ensureDefaultAccount();
          } catch (error) {
            console.error("Database initialization error:", error);
          }
        }));
      }
      if (path === "/api/health" || path === "/health") {
        return await healthHandler(request, env);
      }
      if (path === "/api/accounts" || path === "/accounts") {
        return await accountsHandler(request, env);
      }
      if (path === "/api/portfolio" || path === "/portfolio") {
        return await portfolioHandler(request, env);
      }
      if (path === "/" || path === "/api") {
        return createResponse({
          name: "Portfolio API",
          version: "1.0.0",
          environment: "Cloudflare Workers",
          endpoints: {
            health: "/api/health",
            accounts: "/api/accounts",
            portfolio: "/api/portfolio"
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return createResponse(
        { error: "Not Found", path },
        404
      );
    } catch (error) {
      console.error("Worker error:", error);
      return createResponse(
        {
          error: "Internal Server Error",
          message: error.message,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        500
      );
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-s9MFna/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-s9MFna/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
