import { Router } from 'express';
import { ApiResponse } from '@portfolio/shared';
import PriceService from '../services/priceService';

const router = Router();

export default function createSearchRoutes(priceService: PriceService) {
  // Search for stocks and crypto
  router.get('/', async (req, res) => {
    try {
      const { q: query, type } = req.query;

      if (!query || typeof query !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Query parameter is required'
        };
        return res.status(400).json(response);
      }

      let results: any[] = [];

      if (!type || type === 'stock') {
        const stockResults = await priceService.searchStocks(query);
        results = results.concat(stockResults);
      }

      if (!type || type === 'crypto') {
        const cryptoResults = await priceService.searchCrypto(query);
        results = results.concat(cryptoResults);
      }

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results
      };
      res.json(response);
    } catch (error) {
      console.error('Error searching assets:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search assets'
      };
      res.status(500).json(response);
    }
  });

  return router;
}