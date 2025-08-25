# Personal Stock & Crypto Portfolio Tracker

A personal portfolio tracking application for stocks and cryptocurrencies with automated updates and manual refresh capabilities, featuring both web and iOS mobile apps.

## 🏗️ Architecture

### Tech Stack
- **Frontend (Web)**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Mobile (iOS)**: React Native, Expo, TypeScript
- **Backend**: Cloudflare Workers, D1 Database, KV Storage
- **APIs**: Alpha Vantage (free - 25 calls/day), CoinGecko (free - 100 calls/min)
- **Deployment**: Vercel (web) + Cloudflare Workers (API)
- **Build System**: npm workspaces with concurrency support
- **Data Strategy**: Edge caching + on-demand updates

### Project Structure
```
cc-vision/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and API clients
│   │   │   └── types/       # TypeScript type definitions
│   │   ├── public/          # Static assets
│   │   ├── vercel.json      # Vercel deployment config
│   │   └── package.json
│   ├── mobile/              # React Native application
│   │   ├── app/             # Expo Router pages
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── services/    # API services
│   │   │   ├── hooks/       # Custom hooks
│   │   │   └── utils/       # Utility functions
│   │   ├── app.json         # Expo configuration
│   │   └── package.json
│   └── api/                 # Cloudflare Workers backend
│       ├── src/
│       │   ├── cloudflare/  # Cloudflare-specific implementations
│       │   │   ├── models/  # D1 Database models
│       │   │   └── services/ # KV Cache services
│       │   ├── handlers/    # API route handlers
│       │   ├── worker.js    # Cloudflare Workers entry point
│       │   └── types/       # TypeScript definitions
│       ├── wrangler.toml    # Cloudflare configuration
│       ├── setup-cloudflare.sh # Setup script
│       └── package.json
└── package.json            # Root package.json (npm workspaces)
```

## 🚀 Features

### Core Features
- **Portfolio Management**: Add/edit/remove your stock and crypto holdings
- **Real-time P&L Tracking**: Track profits/losses on your investments
- **Interactive Charts**: Historical price data with various time ranges
- **Asset Search**: Quick search for stocks and crypto to add to portfolio
- **Performance Analytics**: Portfolio performance over time
- **Manual Refresh**: Update prices immediately when you open the app
- **Automated Updates**: Background price updates every hour

### Technical Features
- **Cross-platform**: Responsive web app and native iOS app
- **Smart Caching**: Hourly automated updates + instant refresh on demand
- **Offline Support**: View cached portfolio data offline
- **Dark/Light Mode**: Theme switching support
- **No Authentication**: Personal use only, no login required
- **Efficient API Usage**: Optimized for free API tier limits

## 🛠️ Development Setup

### Prerequisites
- Node.js 20+ and npm
- Cloudflare account (for D1 database and KV storage)
- Wrangler CLI (`npm install -g wrangler`)
- Expo CLI (for mobile development)

### Environment Variables
Create `.env` files in each app directory:

**apps/api/.env** (Optional - for external APIs only)
```env
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key  # Optional for stock data
COINGECKO_API_KEY=your_coingecko_key  # Optional for crypto data
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8787  # Cloudflare Workers dev server
```

**apps/mobile/.env**
```env
EXPO_PUBLIC_API_URL=http://localhost:8787  # Cloudflare Workers dev server
```

### Installation & Running

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd cc-vision
   npm install
   ```

2. **Setup Cloudflare D1 Database**
   ```bash
   cd apps/api
   
   # Login to Cloudflare
   wrangler login
   
   # Create D1 database
   wrangler d1 create portfolio-db
   
   # Create KV namespace
   wrangler kv:namespace create "PORTFOLIO_KV"
   
   # Update wrangler.toml with the generated IDs
   ```

3. **Start development services**
   ```bash
   # Start all applications (D1 tables auto-created)
   npm run dev
   ```

4. **Individual app commands**
   ```bash
   # Web app (http://localhost:3000)
   npm run dev:web
   
   # API server with Cloudflare Workers (http://localhost:8787)
   npm run dev:api
   
   # Mobile app
   npm run dev:mobile
   ```

## 📱 Mobile Development

### iOS Development
```bash
cd apps/mobile
npx expo start --ios
```

### Building for Production
```bash
# Web build
npm run build:web

# Mobile build
cd apps/mobile
npx expo build:ios
```

## 🚢 Deployment

### Current Architecture
The project uses **Cloudflare's edge infrastructure**:

1. **Web App**: Vercel (Next.js frontend)
2. **API**: Cloudflare Workers (serverless functions)
3. **Database**: Cloudflare D1 (SQLite-compatible)
4. **Cache**: Cloudflare KV (key-value storage)

### Web App Deployment (Vercel)
1. Connect your repository to Vercel
2. Set build root directory to `apps/web`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
   ```
4. Deploy automatically on push to main

### API Deployment (Cloudflare Workers)
1. Configure `wrangler.toml` with your account details
2. Set environment variables in Cloudflare dashboard or wrangler:
   ```bash
   # Deploy to production
   cd apps/api
   npm run deploy
   
   # Deploy to staging
   npm run deploy:staging
   ```
3. Environment variables (optional):
   ```env
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
   COINGECKO_API_KEY=your-coingecko-key
   ```

### Database & Storage
- **Cloudflare D1**: Serverless SQLite database with global distribution
- **Cloudflare KV**: Key-value storage for caching and sessions
- **Backup**: Use `wrangler d1 backup` for database backups

## 🔧 API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get complete portfolio with current values
- `POST /api/portfolio/holdings` - Add new holding
- `PUT /api/portfolio/holdings/:id` - Update holding (quantity, cost basis)
- `DELETE /api/portfolio/holdings/:id` - Remove holding
- `POST /api/portfolio/refresh` - Force refresh all prices

### Asset Data
- `GET /api/search?q=AAPL&type=stock` - Search stocks/crypto
- `GET /api/prices/:symbol` - Get current price and daily change
- `GET /api/chart/:symbol?period=1d` - Get historical chart data

## 📊 Data Structure

### Portfolio Holdings
```typescript
interface Holding {
  id: string;
  accountId: string;       // Account this holding belongs to
  symbol: string;           // e.g., "AAPL", "BTC"
  name?: string;           // e.g., "Apple Inc.", "Bitcoin"
  type: 'stock' | 'crypto' | 'etf' | 'mutual_fund' | 'bond' | 'cash';
  quantity: number;        // Number of shares/coins owned
  costBasis: number;       // Average cost per share/coin
  currentPrice?: number;   // Latest price (updated hourly)
  lastUpdated?: Date;      // When price was last fetched
  createdAt: Date;
  updatedAt: Date;
}
```

### Portfolio Summary
```typescript
interface PortfolioSummary {
  totalValue: number;           // Current total portfolio value
  totalCost: number;           // Total amount invested
  totalGainLoss: number;       // Unrealized P&L
  totalGainLossPercent: number; // P&L percentage
  lastUpdated: Date;
  holdings: Holding[];
}
```

### Update Strategy
- **Hourly Background Job**: Updates all holdings automatically
- **Manual Refresh**: Updates when user opens app or pulls to refresh
- **Smart Caching**: Only calls APIs when data is stale (>5 minutes old)
- **API Limits**: Max 25 stock calls/day (Alpha Vantage), 100 crypto calls/min (CoinGecko)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific app
npm run test:web
npm run test:api
npm run test:mobile
```

## 📊 Monitoring & Analytics

- **Error Tracking**: Integration with Sentry
- **Performance**: Web Vitals monitoring
- **API Usage**: Rate limiting and usage analytics
- **Real-time Metrics**: Dashboard for system health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 API Documentation

### External APIs Used
- **Alpha Vantage**: Stock market data (25 requests/day free)
- **CoinGecko**: Cryptocurrency data (100 requests/minute free)

### Rate Limiting & Caching Strategy
- **On-Demand Updates**: Manual refresh when opening app
- **Cloudflare KV Caching**: Store prices with 5-minute expiry for quick access
- **Smart API Usage**: Only fetch when cache is expired or on manual refresh
- **Edge Caching**: Global distribution via Cloudflare's edge network

## 🚨 Important Notes

### Personal Usage Optimizations
- **No Authentication**: Simplified for personal use only
- **Cloudflare D1 Database**: Serverless SQLite with global replication
- **Free APIs Only**: Designed to work within free tier limits
- **Smart Caching**: Minimizes API calls while keeping data fresh
- **Edge Computing**: Fast response times via Cloudflare Workers

### Development Considerations
- **API Rate Limits**: 25 stock calls/day max (Alpha Vantage)
- **Data Backup**: Use `wrangler d1 backup` for database backups
- **Environment Variables**: Keep API keys secure in Cloudflare dashboard
- **Mobile Testing**: Use Expo for easy iOS testing
- **Global Deployment**: Automatic deployment to 200+ edge locations