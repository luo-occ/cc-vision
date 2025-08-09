import { MarketDataProvider, AssetPrice, HistoricalPrice, AssetSearchResult, MarketDataError } from '../types/marketData';
import { YahooFinanceProvider } from '../providers/yahooFinanceProvider';
import { AlphaVantageProvider } from '../providers/alphaVantageProvider';
import { CoinGeckoProvider } from '../providers/coinGeckoProvider';

export class MarketDataRegistry {
  private providers: MarketDataProvider[] = [];
  private errors: MarketDataError[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize providers based on configuration
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const coinGeckoKey = process.env.COINGECKO_API_KEY;

    // Always add Yahoo Finance (free, no API key needed)
    this.providers.push(new YahooFinanceProvider());

    // Add Alpha Vantage if API key is available
    if (alphaVantageKey) {
      this.providers.push(new AlphaVantageProvider(alphaVantageKey));
    }

    // Add CoinGecko (works with or without API key)
    this.providers.push(new CoinGeckoProvider(coinGeckoKey));

    // Sort providers by priority
    this.sortProviders();
  }

  private sortProviders(): void {
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async getCurrentPrice(symbol: string, currency: string = 'USD'): Promise<AssetPrice | null> {
    for (const provider of this.getEnabledProviders()) {
      try {
        const price = await provider.getCurrentPrice(symbol, currency);
        if (price) {
          return price;
        }
      } catch (error) {
        this.logError(provider.name, symbol, error instanceof Error ? error.message : String(error));
      }
    }

    return null;
  }

  async getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency: string = 'USD'): Promise<HistoricalPrice[]> {
    for (const provider of this.getEnabledProviders()) {
      try {
        const prices = await provider.getHistoricalPrices(symbol, startDate, endDate, currency);
        if (prices.length > 0) {
          return prices;
        }
      } catch (error) {
        this.logError(provider.name, symbol, error instanceof Error ? error.message : String(error));
      }
    }

    return [];
  }

  async searchAssets(query: string): Promise<AssetSearchResult[]> {
    const allResults: AssetSearchResult[] = [];
    const seenSymbols = new Set<string>();

    for (const provider of this.getEnabledProviders()) {
      try {
        const results = await provider.searchAssets(query);
        
        for (const result of results) {
          const key = `${result.symbol}-${result.type}`;
          if (!seenSymbols.has(key)) {
            seenSymbols.add(key);
            allResults.push(result);
          }
        }

        // If we have enough results, return early
        if (allResults.length >= 10) {
          break;
        }
      } catch (error) {
        this.logError(provider.name, query, error instanceof Error ? error.message : String(error));
      }
    }

    return allResults.slice(0, 10);
  }

  async getBatchPrices(symbols: string[], currency: string = 'USD'): Promise<Map<string, AssetPrice>> {
    const results = new Map<string, AssetPrice>();
    const remainingSymbols = new Set(symbols);

    // Try each provider until we get all symbols or run out of providers
    for (const provider of this.getEnabledProviders()) {
      if (remainingSymbols.size === 0) break;

      try {
        // Process in batches to respect rate limits
        const batchSize = this.getBatchSize(provider.name);
        const symbolArray = Array.from(remainingSymbols);
        
        for (let i = 0; i < symbolArray.length; i += batchSize) {
          const batch = symbolArray.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (symbol) => {
            try {
              const price = await provider.getCurrentPrice(symbol, currency);
              if (price) {
                results.set(symbol, price);
                remainingSymbols.delete(symbol);
              }
            } catch (error) {
              this.logError(provider.name, symbol, error instanceof Error ? error.message : String(error));
            }
          });

          await Promise.all(batchPromises);
          
          // Add delay between batches for rate limiting
          if (i + batchSize < symbolArray.length) {
            await this.delay(this.getBatchDelay(provider.name));
          }
        }
      } catch (error) {
        this.logError(provider.name, 'batch', error instanceof Error ? error.message : String(error));
      }
    }

    return results;
  }

  private getEnabledProviders(): MarketDataProvider[] {
    return this.providers.filter(p => p.enabled);
  }

  private getBatchSize(providerName: string): number {
    switch (providerName) {
      case 'Yahoo Finance':
        return 2; // Conservative for Yahoo Finance
      case 'Alpha Vantage':
        return 5; // Alpha Vantage allows more
      case 'CoinGecko':
        return 10; // CoinGecko allows batch requests
      default:
        return 1;
    }
  }

  private getBatchDelay(providerName: string): number {
    switch (providerName) {
      case 'Yahoo Finance':
        return 1000; // 1 second between batches
      case 'Alpha Vantage':
        return 12000; // 12 seconds between batches (rate limit)
      case 'CoinGecko':
        return 1000; // 1 second between batches
      default:
        return 1000;
    }
  }

  private logError(provider: string, symbol: string, error: string): void {
    const errorEntry: MarketDataError = {
      provider,
      symbol,
      error,
      timestamp: new Date(),
    };

    this.errors.push(errorEntry);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    console.error(`Market Data Error - ${provider} for ${symbol}: ${error}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getProviderStatus(): Array<{
    name: string;
    enabled: boolean;
    priority: number;
  }> {
    return this.providers.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
    }));
  }

  getRecentErrors(): MarketDataError[] {
    return this.errors.slice(-20); // Return last 20 errors
  }

  updateProviderConfig(providerName: string, config: { enabled?: boolean; apiKey?: string }): void {
    const provider = this.providers.find(p => p.name === providerName);
    if (!provider) return;

    if (config.enabled !== undefined) {
      provider.enabled = config.enabled;
    }

    // Update API key for specific providers
    if (config.apiKey) {
      if (provider instanceof AlphaVantageProvider) {
        provider.updateApiKey(config.apiKey);
      } else if (provider instanceof CoinGeckoProvider) {
        provider.updateApiKey(config.apiKey);
      }
    }

    this.sortProviders();
  }
}