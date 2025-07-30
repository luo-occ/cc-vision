import cron from 'node-cron';
import PortfolioService from '../services/portfolioService';

class PriceUpdateScheduler {
  private portfolioService: PortfolioService;
  private task: cron.ScheduledTask | null = null;

  constructor(portfolioService: PortfolioService) {
    this.portfolioService = portfolioService;
  }

  start(): void {
    // Run every hour (0 minutes past the hour)
    this.task = cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled price update...');
      try {
        await this.portfolioService.refreshAllPrices();
        console.log('Scheduled price update completed');
      } catch (error) {
        console.error('Error in scheduled price update:', error);
      }
    });

    console.log('Price update scheduler started (hourly updates)');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('Price update scheduler stopped');
    }
  }
}

export default PriceUpdateScheduler;