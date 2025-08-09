import EnhancedPriceService from '../services/enhancedPriceService';
import { Router } from 'express';
import createPricesRoutes from '../routes/prices';

const router = Router();

// Initialize the enhanced price service
const priceService = new EnhancedPriceService();

// Register all price routes
router.use('/', createPricesRoutes(priceService));

// Add configuration endpoint
router.post('/config', async (req, res) => {
  try {
    const { providers, cache } = req.body;
    
    priceService.updateConfig({
      providers,
      cache,
    });

    res.json({
      success: true,
      data: { message: 'Configuration updated successfully' }
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update configuration'
    });
  }
});

export default router;