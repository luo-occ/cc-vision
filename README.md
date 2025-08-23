# Personal Stock & Crypto Portfolio Tracker

A personal portfolio tracking application for stocks and cryptocurrencies with automated updates and manual refresh capabilities, featuring both web and iOS mobile apps.

## 🏗️ Architecture

### Tech Stack
- **Frontend (Web)**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Mobile (iOS)**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis
- **APIs**: Alpha Vantage (free - 25 calls/day), CoinGecko (free - 100 calls/min)
- **Deployment**: Vercel (web & API as separate projects)
- **Build System**: npm workspaces (simplified from TurboRepo)
- **Data Strategy**: Hourly automated updates + manual refresh on app open

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
│   └── api/                 # Node.js Express backend
│       ├── src/
│       │   ├── api/         # Main API router
│       │   ├── routes/      # Feature-specific routes
│       │   ├── services/    # Business logic services
│       │   ├── models/      # Database models (PostgreSQL)
│       │   ├── providers/   # External API providers
│       │   ├── middleware/  # Express middleware
│       │   ├── types/       # TypeScript definitions
│       │   └── utils/       # Utility functions
│       ├── dist/            # Compiled JavaScript
│       ├── tsconfig.json    # TypeScript configuration
│       └── package.json
├── docker-compose.yml       # PostgreSQL & Redis for development
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
- Docker and Docker Compose
- Expo CLI (for mobile development)
- Redis (or use Docker)
- PostgreSQL (or use Docker)

### Environment Variables
Create `.env` files in each app directory:

**apps/api/.env**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio  # PostgreSQL connection
REDIS_URL=redis://localhost:6379
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
COINGECKO_API_KEY=your_coingecko_key  # Optional for higher limits
UPDATE_INTERVAL=3600000  # 1 hour in milliseconds
PORT=3001
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/mobile/.env**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Installation & Running

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd cc-vision
   npm install
   ```

2. **Start development services**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d
   
   # Start all applications (database tables auto-created)
   npm run dev
   ```

3. **Individual app commands**
   ```bash
   # Web app (http://localhost:3000)
   npm run dev:web
   
   # API server (http://localhost:3001)
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
The project is deployed as **two separate Vercel projects**:

1. **Web App**: `cc-vision-web` (Next.js frontend)
2. **API**: `cc-vision-api` (Node.js backend as serverless functions)

### Web App Deployment (Vercel)
1. Connect your repository to Vercel
2. Set build root directory to `apps/web`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-deployment.vercel.app
   ```
4. Deploy automatically on push to main

### API Deployment (Vercel)
1. Create separate Vercel project for API
2. Set build root directory to `apps/api`  
3. Set environment variables in Vercel dashboard:
   ```env
   DATABASE_URL=your-postgresql-connection-string
   REDIS_URL=your-redis-connection-string
   ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
   COINGECKO_API_KEY=your-coingecko-key
   ```
4. Deploy automatically on API changes

### Alternative: Docker Deployment
```bash
# Build and deploy API to your server
cd apps/api
docker build -t cc-vision-api .
docker run -p 3001:3001 --env-file .env cc-vision-api
```

### Database
- **PostgreSQL**: Robust relational database with Docker support
- **Backup**: Use `pg_dump` or Docker volume backups

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
- **Hourly Updates**: Automated background job updates all holdings
- **On-Demand Refresh**: Manual refresh when opening app
- **Redis Caching**: Store prices with 5-minute expiry for quick access
- **Smart API Usage**: Only fetch when cache is expired or on manual refresh

## 🚨 Important Notes

### Personal Usage Optimizations
- **No Authentication**: Simplified for personal use only
- **PostgreSQL Database**: Robust, production-ready storage
- **Free APIs Only**: Designed to work within free tier limits
- **Smart Caching**: Minimizes API calls while keeping data fresh
- **Hourly Updates**: Background updates + manual refresh on app open

### Development Considerations
- **API Rate Limits**: 25 stock calls/day max (Alpha Vantage)
- **Data Backup**: Use Docker volumes or `pg_dump` for backups
- **Environment Variables**: Keep API keys secure
- **Mobile Testing**: Use Expo for easy iOS testing