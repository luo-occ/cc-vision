import { Router } from 'express';
import { ApiResponse } from '@portfolio/shared';
import EnhancedPriceService from '../services/enhancedPriceService';

const router = Router();

export default function createSearchRoutes(priceService: EnhancedPriceService) {
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

      let results = await priceService.searchAssets(query);
      
      // Filter by type if specified
      if (type) {
        results = results.filter(result => result.type === type);
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