import axios from 'axios';
import { AssetPrice, HistoricalPrice, AssetSearchResult, MarketDataProvider } from '../types/marketData';

export class YahooFinanceProvider implements MarketDataProvider {
  name = 'Yahoo Finance';
  priority = 1;
  enabled = true;

  private readonly baseUrl = 'https://query1.finance.yahoo.com';
  private readonly baseUrl2 = 'https://query2.finance.yahoo.com';

  async getCurrentPrice(symbol: string, currency: string = 'USD'): Promise<AssetPrice | null> {
    try {
      // Use Yahoo Finance's v8 API for current prices
      const url = `${this.baseUrl}/v8/finance/chart/${symbol}`;
      
      const response = await axios.get(url, {
        params: {
          region: 'US',
          lang: 'en-US',
          includePrePost: false,
          interval: '1m',
          range: '1d',
        },
        timeout: 10000,
      });

      const chart = response.data.chart;
      if (!chart || !chart.result || chart.result.length === 0) {
        return null;
      }

      const result = chart.result[0];
      const meta = result.meta;
      
      if (!meta || !meta.regularMarketPrice) {
        return null;
      }

      return {
        symbol: meta.symbol,
        price: meta.regularMarketPrice,
        change24h: meta.regularMarketPrice - meta.previousClose,
        changePercent24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
      return null;
    }
  }

  async getHistoricalPrices(symbol: string, startDate: Date, endDate: Date, currency: string = 'USD'): Promise<HistoricalPrice[]> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const url = `${this.baseUrl}/v8/finance/chart/${symbol}`;
      
      const response = await axios.get(url, {
        params: {
          period1: startTimestamp,
          period2: endTimestamp,
          interval: '1d',
          includePrePost: false,
        },
        timeout: 15000,
      });

      const chart = response.data.chart;
      if (!chart || !chart.result || chart.result.length === 0) {
        return [];
      }

      const result = chart.result[0];
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      const prices: HistoricalPrice[] = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        const date = new Date(timestamps[i] * 1000);
        const open = quotes.open?.[i];
        const high = quotes.high?.[i];
        const low = quotes.low?.[i];
        const close = quotes.close?.[i];
        const volume = quotes.volume?.[i];

        if (open !== null && open !== undefined &&
            high !== null && high !== undefined &&
            low !== null && low !== undefined &&
            close !== null && close !== undefined) {
          
          prices.push({
            symbol,
            date: date.toISOString().split('T')[0],
            open,
            high,
            low,
            close,
            volume,
          });
        }
      }

      return prices;
    } catch (error) {
      console.error(`Yahoo Finance historical error for ${symbol}:`, error);
      return [];
    }
  }

  async searchAssets(query: string): Promise<AssetSearchResult[]> {
    try {
      const url = `${this.baseUrl2}/v1/finance/search`;
      
      const response = await axios.get(url, {
        params: {
          q: query,
          quotesCount: 10,
          newsCount: 0,
          listsCount: 0,
          enableFuzzyQuery: false,
          quotesQueryId: 'tss_match_phrase_query',
        },
        timeout: 10000,
      });

      const quotes = response.data.quotes || [];
      
      return quotes
        .filter((quote: any) => quote.symbol && quote.shortname)
        .map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.shortname || quote.longname,
          type: this.mapQuoteType(quote.quoteType),
          exchange: quote.exchange,
          currency: quote.currency,
        }))
        .slice(0, 10);
    } catch (error) {
      console.error('Yahoo Finance search error:', error);
      return [];
    }
  }

  private mapQuoteType(quoteType: string): AssetSearchResult['type'] {
    const typeMap: { [key: string]: AssetSearchResult['type'] } = {
      'EQUITY': 'stock',
      'ETF': 'etf',
      'MUTUALFUND': 'mutual_fund',
      'CRYPTOCURRENCY': 'crypto',
    };
    
    return typeMap[quoteType] || 'stock';
  }
}