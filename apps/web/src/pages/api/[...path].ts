import { Router } from 'express';
import apiRouter from './api';

const router = Router();

// API routes
router.use('/api', apiRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;