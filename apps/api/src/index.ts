import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/portfolio';

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
    // Initialize database and services
    const database = new Database(DATABASE_URL);
    
    // Initialize database tables
    await database.initializeTables();
    
    const holdingsModel = new HoldingsModel(database);
    const accountsModel = new AccountsModel(database);
    const accountService = new AccountService(accountsModel);
    const priceService = new EnhancedPriceService();
    const portfolioService = new PortfolioService(holdingsModel, priceService);

    // Initialize price update scheduler
    const scheduler = new PriceUpdateScheduler(portfolioService);
    scheduler.start();

    // Ensure default account exists
    await accountService.ensureDefaultAccount();

    // Setup routes
    app.use('/api/portfolio', createPortfolioRoutes(holdingsModel, portfolioService));
    app.use('/api/accounts', createAccountRoutes(accountService));
    app.use('/api/search', createSearchRoutes(priceService));
    app.use('/api/prices', enhancedPricesRouter);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio API server running on port ${PORT}`);
      console.log(`📊 Database: ${DATABASE_URL}`);
      console.log(`⏰ Price updates: Every hour`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('Shutting down gracefully...');
      scheduler.stop();
      await priceService.close();
      await database.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('Shutting down gracefully...');
      scheduler.stop();
      await priceService.close();
      await database.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();