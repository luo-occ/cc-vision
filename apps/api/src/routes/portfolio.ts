import { Router } from 'express';
import { CreateHoldingRequest, UpdateHoldingRequest, ApiResponse } from '@portfolio/shared';
import HoldingsModel from '../models/holdings';
import PortfolioService from '../services/portfolioService';

const router = Router();

export default function createPortfolioRoutes(
  holdingsModel: HoldingsModel,
  portfolioService: PortfolioService
) {
  // Get complete portfolio
  router.get('/', async (req, res) => {
    try {
      const portfolio = await portfolioService.getPortfolioSummary();
      const response: ApiResponse<typeof portfolio> = {
        success: true,
        data: portfolio
      };
      res.json(response);
    } catch (error) {
      console.error('Error getting portfolio:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to retrieve portfolio'
      };
      res.status(500).json(response);
    }
  });

  // Add new holding
  router.post('/holdings', async (req, res) => {
    try {
      const holdingData: CreateHoldingRequest = req.body;
      
      // Validate required fields
      if (!holdingData.symbol || !holdingData.name || !holdingData.type || 
          !holdingData.quantity || !holdingData.costBasis) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields'
        };
        return res.status(400).json(response);
      }

      if (holdingData.quantity <= 0 || holdingData.costBasis <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Quantity and cost basis must be positive'
        };
        return res.status(400).json(response);
      }

      const holding = await holdingsModel.create(holdingData);
      
      // Fetch initial price for the new holding
      await portfolioService.fetchAndUpdatePriceForNewHolding(holding.symbol, holding.type);
      
      const response: ApiResponse<typeof holding> = {
        success: true,
        data: holding
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating holding:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create holding'
      };
      res.status(500).json(response);
    }
  });

  // Update holding
  router.put('/holdings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates: UpdateHoldingRequest = req.body;

      if (updates.quantity !== undefined && updates.quantity <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Quantity must be positive'
        };
        return res.status(400).json(response);
      }

      if (updates.costBasis !== undefined && updates.costBasis <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cost basis must be positive'
        };
        return res.status(400).json(response);
      }

      const holding = await holdingsModel.update(id, updates);
      
      if (!holding) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Holding not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof holding> = {
        success: true,
        data: holding
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating holding:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update holding'
      };
      res.status(500).json(response);
    }
  });

  // Delete holding
  router.delete('/holdings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await holdingsModel.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Holding not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting holding:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete holding'
      };
      res.status(500).json(response);
    }
  });

  // Force refresh all prices
  router.post('/refresh', async (req, res) => {
    try {
      await portfolioService.refreshAllPrices();
      const portfolio = await portfolioService.getPortfolioSummary();
      
      const response: ApiResponse<typeof portfolio> = {
        success: true,
        data: portfolio
      };
      res.json(response);
    } catch (error) {
      console.error('Error refreshing prices:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to refresh prices'
      };
      res.status(500).json(response);
    }
  });

  return router;
}