import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './api';

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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

async function startServer() {
  try {
    // Check if we have a database URL
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (DATABASE_URL) {
      console.log('🚀 Portfolio API server running on port', PORT);
      console.log('📊 Database:', DATABASE_URL);
      console.log('⏰ Price updates: Every hour');
    } else {
      // No database - run in demo mode
      console.log('🚀 Portfolio API server running in DEMO MODE on port', PORT);
      console.log('📊 Database: In-memory (demo mode)');
      console.log('⚠️  No external database configured - using mock data');
    }
    
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();