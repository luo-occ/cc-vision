# Portfolio Tracker Setup Instructions

## Quick Start

Follow these steps to get your personal stock and crypto portfolio tracker running:

### 1. Install Dependencies

```bash
# Install all dependencies
pnpm install
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

### 6. Start All Applications

```bash
# Start all apps simultaneously
pnpm run dev
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
pnpm run dev:api

# Web app only
pnpm run web

# Mobile app only
pnpm run dev:mobile
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

### Web App (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### API Server (Docker)

```bash
cd apps/api
docker build -t portfolio-api .
docker run -p 3001:3001 --env-file .env portfolio-api
```

## Features Overview

### ✅ Portfolio Management

- Add/edit/remove stock and crypto holdings
- Track quantity and cost basis
- Real-time P&L calculations

### ✅ Price Updates

- Automated hourly updates
- Manual refresh on demand
- Smart caching (5-minute expiry)

### ✅ Cross-Platform

- Responsive web interface
- Native iOS mobile app
- Shared data between platforms

### ✅ Free API Usage

- Alpha Vantage: 25 stock calls/day
- CoinGecko: 100 crypto calls/minute
- Efficient caching minimizes API usage

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
