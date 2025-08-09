import axios from 'axios';
import { AssetPrice, HistoricalPrice, AssetSearchResult, MarketDataProvider } from '../types/marketData';

export class AlphaVantageProvider implements MarketDataProvider {
  name = 'Alpha Vantage';
  priority = 2;
  enabled: boolean;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';
  private lastCallTime = 0;
  private readonly minCallInterval = 12000; // 12 seconds between calls (5 calls/minute)

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.enabled = !!apiKey;
  }

  async getCurrentPrice(symbol: string, currency: string = 'USD'): Promise<AssetPrice | null> {
    if (!this.enabled) return null;
    
    try {
      await this.rateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        if (response.data['Error Message']) {
          console.error(`Alpha Vantage error for ${symbol}:`, response.data['Error Message']);
        }
        return null;
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change24h: parseFloat(quote['09. change']),
        changePercent24h: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']) || undefined,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency: string = 'USD'): Promise<HistoricalPrice[]> {
    if (!this.enabled) return [];
    
    try {
      await this.rateLimit();
      
      // Use TIME_SERIES_DAILY for historical data
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: 'full',
          apikey: this.apiKey,
        },
        timeout: 15000,
      });

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        console.error(`Alpha Vantage historical error for ${symbol}: No time series data`);
        return [];
      }

      const prices: HistoricalPrice[] = [];
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      for (const [date, data] of Object.entries(timeSeries)) {
        if (date >= start && date <= end) {
          const priceData = data as any;
          prices.push({
            symbol,
            date,
            open: parseFloat(priceData['1. open']),
            high: parseFloat(priceData['2. high']),
            low: parseFloat(priceData['3. low']),
            close: parseFloat(priceData['4. close']),
            volume: parseInt(priceData['5. volume']) || undefined,
          });
        }
      }

      // Sort by date ascending
      return prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error(`Alpha Vantage historical error for ${symbol}:`, error);
      return [];
    }
  }

  async searchAssets(query: string): Promise<AssetSearchResult[]> {
    if (!this.enabled) return [];
    
    try {
      await this.rateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: query,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const matches = response.data.bestMatches || [];
      
      return matches
        .map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: this.mapType(match['3. type']),
          exchange: match['4. region'],
          currency: match['8. currency'],
        }))
        .slice(0, 10);
    } catch (error) {
      console.error('Alpha Vantage search error:', error);
      return [];
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minCallInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minCallInterval - timeSinceLastCall));
    }
    
    this.lastCallTime = Date.now();
  }

  private mapType(type: string): AssetSearchResult['type'] {
    const typeMap: { [key: string]: AssetSearchResult['type'] } = {
      'Equity': 'stock',
      'ETF': 'etf',
      'Mutual Fund': 'mutual_fund',
      'Cryptocurrency': 'crypto',
    };
    
    return typeMap[type] || 'stock';
  }

  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.enabled = !!apiKey;
  }
}