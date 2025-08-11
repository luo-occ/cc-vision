import { PortfolioSummary, Holding } from '@portfolio/shared';
import HoldingsModel from '../models/holdings';
import EnhancedPriceService from './enhancedPriceService';

class PortfolioService {
  private holdingsModel: HoldingsModel;
  private priceService: EnhancedPriceService;

  constructor(holdingsModel: HoldingsModel, priceService: EnhancedPriceService) {
    this.holdingsModel = holdingsModel;
    this.priceService = priceService;
  }

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const holdings = await this.holdingsModel.findAll();
    
    let totalValue = 0;
    let totalCost = 0;

    for (const holding of holdings) {
      const costValue = holding.quantity * holding.costBasis;
      totalCost += costValue;

      if (holding.currentPrice) {
        totalValue += holding.quantity * holding.currentPrice;
      } else {
        // If no current price, use cost basis as fallback
        totalValue += costValue;
      }
    }

    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      lastUpdated: new Date(),
      holdings
    };
  }

  async refreshAllPrices(): Promise<void> {
    const holdings = await this.holdingsModel.findAll();
    const symbols = holdings.map(h => h.symbol);
    
    if (symbols.length === 0) {
      console.log('No holdings to refresh prices for');
      return;
    }

    try {
      // Get batch prices for all symbols
      const prices = await this.priceService.getBatchPrices(symbols, 'USD', true);
      
      // Update each holding with its new price
      for (const [symbol, price] of prices) {
        await this.holdingsModel.updatePrice(symbol, price.price);
        console.log(`Updated price for ${symbol}: $${price.price}`);
      }
      
      console.log(`Successfully refreshed prices for ${prices.size} symbols`);
    } catch (error) {
      console.error('Error refreshing all prices:', error);
    }
  }

  async refreshSinglePrice(symbol: string, type: 'stock' | 'crypto'): Promise<number | null> {
    try {
      // Use the enhanced price service to get current price
      const price = await this.priceService.getCurrentPrice(symbol, 'USD', true);

      if (price) {
        await this.holdingsModel.updatePrice(symbol, price.price);
        console.log(`Refreshed price for ${symbol}: $${price.price}`);
        return price.price;
      }
      
      console.warn(`No price found for symbol: ${symbol}`);
      return null;
    } catch (error) {
      console.error(`Error refreshing price for ${symbol}:`, error);
      return null;
    }
  }

  // Method to immediately fetch and update prices for new holdings
  async fetchAndUpdatePriceForNewHolding(symbol: string, type: 'stock' | 'crypto'): Promise<void> {
    try {
      console.log(`Fetching initial price for new holding: ${symbol} (${type})`);
      
      // Force refresh to get the latest price
      const price = await this.priceService.getCurrentPrice(symbol, 'USD', true);
      
      if (price) {
        await this.holdingsModel.updatePrice(symbol, price.price);
        console.log(`Set initial price for ${symbol}: $${price.price} (${price.changePercent24h >= 0 ? '+' : ''}${price.changePercent24h?.toFixed(2)}%)`);
      } else {
        console.warn(`Could not fetch initial price for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error fetching initial price for ${symbol}:`, error);
    }
  }
}

export default PortfolioService;