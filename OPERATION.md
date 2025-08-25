# Portfolio Tracker Operations Guide

Complete guide for development setup and production deployment using Cloudflare D1 database and Workers.

## 🚀 Developer Setup

### Prerequisites

- Node.js 20+ and npm
- Cloudflare account (for D1 database and KV storage)
- Wrangler CLI (`npm install -g wrangler`)
- Expo CLI (for mobile development): `npm install -g @expo/cli`

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd cc-vision
npm install
```

### 2. Cloudflare Setup

```bash
cd apps/api

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create portfolio-db

# Create KV namespace for caching
wrangler kv:namespace create "PORTFOLIO_KV"
wrangler kv:namespace create "PORTFOLIO_KV" --preview

# Update wrangler.toml with the generated IDs from above commands
```

### 3. Environment Variables

#### API (Optional - for external APIs only)
```bash
# apps/api/.env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key  # Optional for stock data
COINGECKO_API_KEY=your_coingecko_key  # Optional for crypto data
```

#### Web App
```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8787  # Cloudflare Workers dev server
```

#### Mobile App
```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:8787  # Cloudflare Workers dev server
```

### 4. Get API Keys (Optional)

#### Alpha Vantage (for stock data)
1. Go to https://www.alphavantage.co/support/#api-key
2. Get your free API key (25 requests/day)
3. Add it to `apps/api/.env`

#### CoinGecko (for crypto data)
- The free tier works without a key (100 calls/minute)
- For higher limits, get a key at https://www.coingecko.com/en/api

### 5. Start Development

```bash
# Start all applications (D1 tables auto-created)
npm run dev
```

This will start:
- **API Server**: http://localhost:8787 (Cloudflare Workers)
- **Web App**: http://localhost:3000
- **Mobile App**: Expo DevTools will open

#### Individual App Commands

```bash
# API server only (Cloudflare Workers)
npm run dev:api

# Web app only
npm run dev:web

# Mobile app only
npm run dev:mobile
```

### 6. Development Tips

#### Proxy Issues
If you encounter proxy issues during development (common with corporate networks), use:

```bash
# For testing API endpoints locally
NO_PROXY=localhost curl -s "http://localhost:8787/health"

# Or set environment variable
export NO_PROXY=localhost
curl -s "http://localhost:8787/api/accounts"
```

#### Database Commands

```bash
# List D1 databases
wrangler d1 list

# Execute SQL queries
wrangler d1 execute portfolio-db --command="SELECT * FROM accounts;"

# Backup database
wrangler d1 backup create portfolio-db

# Restore from backup
wrangler d1 backup restore portfolio-db <backup-id>
```

#### Mobile Development

```bash
cd apps/mobile

# Start for iOS
npx expo start --ios

# Start for Android
npx expo start --android

# Clear cache if needed
npx expo start --clear
```

### 7. Test Your Setup

1. **API Health**: http://localhost:8787/health
2. **Accounts Endpoint**: http://localhost:8787/api/accounts
3. **Web App**: http://localhost:3000
4. **Mobile App**: Scan QR code with Expo Go or press `i` for iOS simulator

## 🚢 Production Deployment

### Architecture Overview

- **Web App**: Vercel (Next.js frontend)
- **API**: Cloudflare Workers (serverless functions)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Cache**: Cloudflare KV (key-value storage)

### 1. Deploy API (Cloudflare Workers)

```bash
cd apps/api

# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging

# Check deployment status
wrangler tail
```

Set environment variables in Cloudflare Dashboard:
```env
ALPHA_VANTAGE_API_KEY=your_key_here
COINGECKO_API_KEY=your_key_here
ENVIRONMENT=production
```

### 2. Deploy Web App (Vercel)

1. Connect your repository to Vercel
2. Set **Root Directory** to `apps/web`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
   ```
4. Deploy automatically on push to main

### 3. Deploy Mobile App

```bash
cd apps/mobile

# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Or use EAS Build (recommended)
npx eas build --platform ios
```

## 🔧 Database Operations

### D1 Database Management

```bash
# View database info
wrangler d1 info portfolio-db

# Execute queries
wrangler d1 execute portfolio-db --command="SELECT COUNT(*) FROM accounts;"

# Import data
wrangler d1 execute portfolio-db --file=./schema.sql

# Export data
wrangler d1 execute portfolio-db --command="SELECT * FROM accounts;" --output=json > accounts.json
```

### Schema Management

The database schema is automatically created on first request. Tables include:
- `accounts` - User accounts for organizing holdings
- `account_tags` - Tags for categorizing accounts  
- `holdings` - Stock and crypto holdings with quantities and prices

## 🐛 Troubleshooting

### Common Development Issues

#### API Server Won't Start
```bash
# Check wrangler version
wrangler --version

# Update wrangler
npm update -g wrangler

# Check D1 database status
wrangler d1 list
```

#### Proxy Issues
```bash
# Bypass proxy for local development
export NO_PROXY=localhost,127.0.0.1

# Or use specific proxy settings
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

#### Mobile App Issues
- Ensure computer and phone are on the same network
- Update API URL in `apps/mobile/.env`
- Clear Expo cache: `npx expo start --clear`

### Common Deployment Issues

#### Cloudflare Workers Issues
```bash
# Check worker logs
wrangler tail

# Test deployment locally
wrangler dev --remote

# Check bindings
wrangler dev --inspect
```

#### D1 Database Issues
```bash
# Check database connectivity
wrangler d1 execute portfolio-db --command="SELECT 1;"

# Recreate database if needed
wrangler d1 create portfolio-db-new
# Update wrangler.toml with new database ID
```

### Debug Commands

```bash
# Test all endpoints locally
NO_PROXY=localhost curl -s "http://localhost:8787/health"
NO_PROXY=localhost curl -s "http://localhost:8787/api/accounts"
NO_PROXY=localhost curl -s "http://localhost:8787/"

# Check build status
npm run build

# Run tests
npm run test
```

## 📊 Monitoring

### Development Monitoring
- Check Cloudflare Workers logs: `wrangler tail`
- Monitor D1 database: `wrangler d1 info portfolio-db`
- Web app logs: Browser DevTools Console

### Production Monitoring
- **Cloudflare Dashboard**: Workers analytics and error rates
- **Vercel Dashboard**: Web app performance metrics
- **D1 Analytics**: Database query performance

## 🎯 Best Practices

### Development
- Always test with `NO_PROXY=localhost` if behind corporate proxy
- Use `wrangler dev --remote` to test with production bindings
- Keep D1 database backups before major changes

### Security
- Store API keys in Cloudflare Workers environment variables
- Never commit secrets to the repository
- Use preview environments for testing

### Performance
- Leverage Cloudflare KV for caching
- Monitor API rate limits (Alpha Vantage: 25 calls/day)
- Use edge caching for better global performance

Happy coding! 🚀