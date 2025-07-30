import { Router } from 'express';
import { ApiResponse } from '@portfolio/shared';
import PriceService from '../services/priceService';

const router = Router();

export default function createPricesRoutes(priceService: PriceService) {
  // Get current price for a symbol
  router.get('/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { type = 'stock' } = req.query;

      if (!symbol) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Symbol parameter is required'
        };
        return res.status(400).json(response);
      }

      let price;
      if (type === 'crypto') {
        price = await priceService.getCryptoPrice(symbol);
      } else {
        price = await priceService.getStockPrice(symbol);
      }

      if (!price) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Price not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof price> = {
        success: true,
        data: price
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting price:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get price'
      };
      res.status(500).json(response);
    }
  });

  return router;
}