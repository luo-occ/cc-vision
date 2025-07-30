import { PortfolioSummary, Holding } from '@portfolio/shared';
import HoldingsModel from '../models/holdings';
import PriceService from './priceService';

class PortfolioService {
  private holdingsModel: HoldingsModel;
  private priceService: PriceService;

  constructor(holdingsModel: HoldingsModel, priceService: PriceService) {
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
    
    for (const holding of holdings) {
      try {
        let price;
        
        if (holding.type === 'stock') {
          price = await this.priceService.getStockPrice(holding.symbol);
        } else {
          price = await this.priceService.getCryptoPrice(holding.symbol);
        }

        if (price) {
          await this.holdingsModel.updatePrice(holding.symbol, price.price);
        }
      } catch (error) {
        console.error(`Error updating price for ${holding.symbol}:`, error);
      }
    }
  }

  async refreshSinglePrice(symbol: string, type: 'stock' | 'crypto'): Promise<number | null> {
    try {
      let price;
      
      if (type === 'stock') {
        price = await this.priceService.getStockPrice(symbol);
      } else {
        price = await this.priceService.getCryptoPrice(symbol);
      }

      if (price) {
        await this.holdingsModel.updatePrice(symbol, price.price);
        return price.price;
      }
      
      return null;
    } catch (error) {
      console.error(`Error refreshing price for ${symbol}:`, error);
      return null;
    }
  }
}

export default PortfolioService;