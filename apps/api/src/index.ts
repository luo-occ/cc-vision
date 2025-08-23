import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import Database from './models/database';
import HoldingsModel from './models/holdings';
import AccountsModel from './models/accounts';
import AccountService from './services/accountService';
import EnhancedPriceService from './services/enhancedPriceService';
import PortfolioService from './services/portfolioService';
import PriceUpdateScheduler from './utils/scheduler';

import createPortfolioRoutes from './routes/portfolio';
import createAccountRoutes from './routes/accounts';
import createSearchRoutes from './routes/search';
import createPricesRoutes from './routes/prices';
import enhancedPricesRouter from './routes/enhancedPrices';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    // Check if we have a database URL
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfolio';
    
    console.log('🚀 Portfolio API server starting...');
    console.log(`📊 Database: ${DATABASE_URL}`);
    
    // Initialize database and services
    const database = new Database(DATABASE_URL);
    await database.initializeTables(); // Ensure tables exist
    
    const holdingsModel = new HoldingsModel(database);
    const accountsModel = new AccountsModel(database);
    const accountService = new AccountService(accountsModel);
    const priceService = new EnhancedPriceService();
    const portfolioService = new PortfolioService(holdingsModel, priceService);

    // Ensure default account exists
    await accountService.ensureDefaultAccount();

    // Initialize price update scheduler
    const scheduler = new PriceUpdateScheduler(portfolioService);
    scheduler.start();

    // Setup routes
    app.use('/api/portfolio', createPortfolioRoutes(holdingsModel, portfolioService));
    app.use('/api/accounts', createAccountRoutes(accountService));
    app.use('/api/search', createSearchRoutes(priceService));
    app.use('/api/prices', createPricesRoutes(priceService));
    app.use('/api/enhanced-prices', enhancedPricesRouter);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio API server running on port ${PORT}`);
      console.log(`📊 Database: Connected to PostgreSQL`);
      console.log(`⏰ Price updates: Every hour`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      scheduler.stop();
      await priceService.close();
      await database.close();
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    
    // Fallback to demo mode if database connection fails
    console.log('🚀 Starting API in DEMO MODE (without database)...');
    
    // Setup basic routes for demo
    app.get('/api/portfolio', (req, res) => {
      res.json({
        success: true,
        data: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          lastUpdated: new Date(),
          holdings: []
        }
      });
    });
    
    app.get('/api/accounts', (req, res) => {
      res.json({
        success: true,
        data: []
      });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server in demo mode
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio API server running in DEMO MODE on port ${PORT}`);
      console.log(`⚠️  Database connection failed - using mock data`);
      console.log(`📊 To enable full functionality, check your DATABASE_URL`);
    });
  }
}

startServer();