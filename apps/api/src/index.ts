import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import Database from './models/database';
import HoldingsModel from './models/holdings';
import PriceService from './services/priceService';
import PortfolioService from './services/portfolioService';
import PriceUpdateScheduler from './utils/scheduler';

import createPortfolioRoutes from './routes/portfolio';
import createSearchRoutes from './routes/search';
import createPricesRoutes from './routes/prices';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DATABASE_PATH || './portfolio.db';

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
    const database = new Database(DB_PATH);
    const holdingsModel = new HoldingsModel(database);
    const priceService = new PriceService();
    const portfolioService = new PortfolioService(holdingsModel, priceService);

    // Initialize price update scheduler
    const scheduler = new PriceUpdateScheduler(portfolioService);
    scheduler.start();

    // Setup routes
    app.use('/api/portfolio', createPortfolioRoutes(holdingsModel, portfolioService));
    app.use('/api/search', createSearchRoutes(priceService));
    app.use('/api/prices', createPricesRoutes(priceService));

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio API server running on port ${PORT}`);
      console.log(`📊 Database: ${DB_PATH}`);
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