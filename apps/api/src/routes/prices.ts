import { Router } from 'express';
import { ApiResponse } from '@portfolio/shared';
import EnhancedPriceService from '../services/enhancedPriceService';

const router = Router();

export default function createPricesRoutes(priceService: EnhancedPriceService) {
  // Get current price for a symbol
  router.get('/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { currency = 'USD', forceRefresh = 'false' } = req.query;

      if (!symbol) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Symbol parameter is required'
        };
        return res.status(400).json(response);
      }

      const price = await priceService.getCurrentPrice(
        symbol, 
        currency as string,
        forceRefresh === 'true'
      );

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

  // Get batch prices for multiple symbols
  router.post('/batch', async (req, res) => {
    try {
      const { symbols, currency = 'USD', forceRefresh = false } = req.body;

      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Symbols array is required'
        };
        return res.status(400).json(response);
      }

      const prices = await priceService.getBatchPrices(
        symbols, 
        currency,
        forceRefresh
      );

      const response: ApiResponse<Map<string, any>> = {
        success: true,
        data: prices
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting batch prices:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get batch prices'
      };
      res.status(500).json(response);
    }
  });

  // Get historical prices
  router.get('/:symbol/historical', async (req, res) => {
    try {
      const { symbol } = req.params;
      const { 
        startDate, 
        endDate, 
        currency = 'USD',
        forceRefresh = 'false'
      } = req.query;

      if (!symbol || !startDate || !endDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Symbol, startDate, and endDate are required'
        };
        return res.status(400).json(response);
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid date format'
        };
        return res.status(400).json(response);
      }

      const prices = await priceService.getHistoricalPrices(
        symbol, 
        start, 
        end, 
        currency as string,
        forceRefresh === 'true'
      );

      const response: ApiResponse<any[]> = {
        success: true,
        data: prices
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting historical prices:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get historical prices'
      };
      res.status(500).json(response);
    }
  });

  // Search assets
  router.get('/search/:query', async (req, res) => {
    try {
      const { query } = req.params;
      const { forceRefresh = 'false' } = req.query;

      if (!query || query.length < 2) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Query must be at least 2 characters'
        };
        return res.status(400).json(response);
      }

      const results = await priceService.searchAssets(
        query,
        forceRefresh === 'true'
      );

      const response: ApiResponse<any[]> = {
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

  // Get provider status
  router.get('/status/providers', async (req, res) => {
    try {
      const status = priceService.getProviderStatus();
      const response: ApiResponse<any[]> = {
        success: true,
        data: status
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting provider status:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get provider status'
      };
      res.status(500).json(response);
    }
  });

  // Get recent errors
  router.get('/status/errors', async (req, res) => {
    try {
      const errors = priceService.getRecentErrors();
      const response: ApiResponse<any[]> = {
        success: true,
        data: errors
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting recent errors:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to get recent errors'
      };
      res.status(500).json(response);
    }
  });

  // Clear cache
  router.post('/cache/clear', async (req, res) => {
    try {
      await priceService.clearCache();
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Cache cleared successfully' }
      };
      res.json(response);
    } catch (error) {
      console.error('Error clearing cache:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to clear cache'
      };
      res.status(500).json(response);
    }
  });

  return router;
}