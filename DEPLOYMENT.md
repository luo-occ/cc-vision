# Vercel Deployment Guide

This guide will help you deploy your Portfolio Tracker application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **Database**: PostgreSQL database (Vercel Postgres or external)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the environment template and update with your values:
```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `ALPHA_VANTAGE_API_KEY` - Alpha Vantage API key
- `COINGECKO_API_KEY` - CoinGecko API key
- `YAHOO_FINANCE_API_KEY` - Yahoo Finance API key

### 3. Database Setup
Your application has been migrated from SQLite to PostgreSQL. The database schema will be automatically created on first run.

### 4. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Link to Git repository (recommended)
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in project settings
5. Deploy

### 5. Post-Deployment

#### Set Environment Variables in Vercel Dashboard:
1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add all required variables from `.env.example`

#### Verify Deployment:
- Check that all services are running
- Test API endpoints
- Verify database connectivity

## Architecture Overview

### Vercel Deployment Structure
- **Next.js App**: Runs on Vercel's Edge Network
- **API Routes**: Deployed as Serverless Functions
- **Database**: PostgreSQL (Vercel Postgres or external)
- **Cache**: Redis (Vercel KV or external)

### Key Changes Made
1. **Database Migration**: SQLite → PostgreSQL
2. **API Structure**: Modified for serverless deployment
3. **Environment Configuration**: Standardized for Vercel
4. **Build Configuration**: Optimized for Vercel platform

## Monitoring and Maintenance

### Vercel Analytics
- Automatic performance monitoring
- Real-time metrics
- Error tracking

### Database Monitoring
- Monitor PostgreSQL performance
- Set up alerts for connection issues
- Regular backups (if using external DB)

### API Monitoring
- Monitor function execution time
- Track error rates
- Set up health checks

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database accessibility
   - Ensure proper permissions

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

3. **Environment Variables**
   - Double-check variable names
   - Ensure proper formatting
   - Verify values are correctly escaped

### Debug Commands
```bash
# Local development
pnpm dev

# Build test
pnpm build

# Type check
pnpm lint

# Clean build
pnpm clean && pnpm build
```

## Support

For deployment issues:
- Check Vercel documentation
- Review build logs
- Contact Vercel support if needed

For application issues:
- Review error logs
- Check database connectivity
- Verify API service status