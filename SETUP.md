# Portfolio Tracker Setup Instructions

## Quick Start

Follow these steps to get your personal stock and crypto portfolio tracker running:

### 1. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Set Up Environment Variables

#### API Server

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and add your API keys:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio
REDIS_URL=redis://localhost:6379
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
COINGECKO_API_KEY=your_coingecko_key_here  # Optional
UPDATE_INTERVAL=3600000
PORT=3001
```

#### Web App

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

#### Mobile App

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Get API Keys (Free)

#### Alpha Vantage (Required for stocks)

1. Go to https://www.alphavantage.co/support/#api-key
2. Get your free API key (25 requests/day)
3. Add it to `apps/api/.env`

#### CoinGecko (Optional for crypto)

- The free tier works without a key
- For higher limits, get a key at https://www.coingecko.com/en/api

### 4. Start PostgreSQL and Redis

```bash
# Using Docker (recommended)
docker-compose up -d

# OR install locally and start services
# PostgreSQL: brew services start postgresql
# Redis: redis-server
```

### 5. Database Setup

The database tables are automatically created when the API server starts. No manual initialization is needed.

**Available Database Tables:**
- `accounts` - User accounts for organizing holdings
- `holdings` - Stock and crypto holdings with quantities and cost basis
- `price_history` - Historical price data for caching

The API includes full PostgreSQL support with:
- Account management (create, update, delete accounts)
- Holdings management (add, edit, remove positions)
- Real-time price fetching from multiple providers
- Automated price updates and caching

### 6. Start All Applications

```bash
# Start all apps simultaneously
npm run dev
```

This will start:

- **API Server**: http://localhost:3001
- **Web App**: http://localhost:3000
- **Mobile App**: Expo DevTools will open

### 7. Test Your Setup

1. **Web App**: Open http://localhost:3000
2. **Mobile App**:
   - Install Expo Go on your phone
   - Scan the QR code from Expo DevTools
   - Or press `i` for iOS simulator

## Individual App Commands

```bash
# API server only
npm run dev:api

# Web app only
npm run dev:web

# Mobile app only
npm run dev:mobile
```

## Adding Your First Holdings

1. Click "Add Holding" in the web app or mobile app
2. Search for a stock (e.g., "AAPL") or crypto (e.g., "BTC")
3. Enter quantity and your average cost basis
4. Save the holding

Your portfolio will automatically update prices every hour!

## Manual Price Refresh

- Click the "Refresh Prices" button to update immediately
- This will fetch the latest prices for all your holdings

## Troubleshooting

### API Key Issues

- Make sure your Alpha Vantage key is valid
- Free tier: 25 requests/day limit
- Check API server logs for errors

### Redis Connection

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Database Issues

```bash
# Restart PostgreSQL and let API recreate tables
docker-compose restart postgres

# OR check PostgreSQL connection
psql -h localhost -U postgres -d portfolio
```

### Mobile App Issues

- Make sure your computer and phone are on the same network
- Update the API URL in mobile/.env if needed

## Production Deployment

### Current Architecture
The project uses **separate Vercel deployments** for optimal performance:

### Web App (Vercel)
1. Create a new Vercel project
2. Set **Root Directory** to `apps/web`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-deployment.vercel.app
   ```
4. Deploy automatically on push

### API Server (Vercel)
1. Create a separate Vercel project for the API
2. Set **Root Directory** to `apps/api`
3. Set environment variables in Vercel dashboard:
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   REDIS_URL=redis://user:pass@host:port
   ALPHA_VANTAGE_API_KEY=your_key_here
   COINGECKO_API_KEY=your_key_here
   ```
4. The API will deploy as serverless functions

### Alternative: Docker Deployment
```bash
cd apps/api
docker build -t cc-vision-api .
docker run -p 3001:3001 --env-file .env cc-vision-api
```

## Features Overview

### ✅ Portfolio Management

- Multi-account support (Securities, Cash, Crypto, etc.)
- Add/edit/remove stock and crypto holdings
- Support for stocks, crypto, ETFs, mutual funds, bonds
- Track quantity and cost basis per holding
- Real-time P&L calculations with current market prices

### ✅ Price Updates

- Automated hourly updates
- Manual refresh on demand
- Smart caching (5-minute expiry)

### ✅ Cross-Platform

- Responsive web interface
- Native iOS mobile app
- Shared data between platforms

### ✅ Market Data & APIs

- **Alpha Vantage**: Stock market data (25 calls/day free)
- **CoinGecko**: Cryptocurrency data (100 calls/minute free)
- **Yahoo Finance**: Backup data source (free, no key required)
- Multi-provider fallback system for reliability
- Smart caching with Redis (5-minute price cache)
- Historical price data and search functionality

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Mobile App    │
│   (Next.js)     │    │   (React Native)│
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌─────────────────┐
          │   API Server    │
          │   (Node.js)     │
          └─────────┬───────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───────┐    ┌────▼────┐    ┌────▼────┐
│PostgreSQL │    │ Redis   │    │External │
│ Database  │    │ Cache   │    │  APIs   │
└───────────┘    └─────────┘    └─────────┘
```

## Support

If you encounter issues:

1. Check the console logs in the API server
2. Verify your API keys are correct
3. Ensure Redis is running
4. Try reinitializing the database

Happy tracking! 📈
