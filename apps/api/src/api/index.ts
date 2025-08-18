import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import Database from '../models/database';
import HoldingsModel from '../models/holdings';
import AccountsModel from '../models/accounts';
import AccountService from '../services/accountService';
import EnhancedPriceService from '../services/enhancedPriceService';
import PortfolioService from '../services/portfolioService';

import createPortfolioRoutes from '../routes/portfolio';
import createAccountRoutes from '../routes/accounts';
import createSearchRoutes from '../routes/search';
import createPricesRoutes from '../routes/prices';
import enhancedPricesRouter from '../routes/enhancedPrices';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';

const router = express.Router();

// Middleware
router.use(helmet());
router.use(cors());
router.use(compression());
router.use(morgan('combined'));
router.use(express.json());

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and services
let database: Database;
let holdingsModel: HoldingsModel;
let accountsModel: AccountsModel;
let accountService: AccountService;
let priceService: EnhancedPriceService;
let portfolioService: PortfolioService;

async function initializeServices() {
  if (!database) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    database = new Database(DATABASE_URL);
    holdingsModel = new HoldingsModel(database);
    accountsModel = new AccountsModel(database);
    accountService = new AccountService(accountsModel);
    priceService = new EnhancedPriceService();
    portfolioService = new PortfolioService(holdingsModel, priceService);
    
    // Ensure default account exists
    await accountService.ensureDefaultAccount();
  }
}

// API Routes
router.use('/portfolio', async (req, res, next) => {
  try {
    await initializeServices();
    createPortfolioRoutes(holdingsModel, portfolioService)(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.use('/accounts', async (req, res, next) => {
  try {
    await initializeServices();
    createAccountRoutes(accountService)(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.use('/search', async (req, res, next) => {
  try {
    await initializeServices();
    createSearchRoutes(priceService)(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.use('/prices', async (req, res, next) => {
  try {
    await initializeServices();
    createPricesRoutes(priceService)(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.use('/enhanced-prices', enhancedPricesRouter);

// Error handling
router.use(notFoundHandler);
router.use(errorHandler);

export default router;