# Personal Stock & Crypto Portfolio Tracker

A personal portfolio tracking application for stocks and cryptocurrencies with automated updates and manual refresh capabilities, featuring both web and iOS mobile apps.

## 🏗️ Architecture

### Tech Stack
- **Frontend (Web)**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Mobile (iOS)**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript, SQLite (for simplicity), Redis
- **APIs**: Alpha Vantage (free - 25 calls/day), CoinGecko (free - 100 calls/min)
- **Deployment**: Vercel (web), Docker (backend)
- **Data Strategy**: Hourly automated updates + manual refresh on app open

### Project Structure
```
stock-crypto-tracker/
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and API clients
│   │   │   └── types/       # TypeScript type definitions
│   │   ├── public/          # Static assets
│   │   └── package.json
│   ├── mobile/              # React Native application
│   │   ├── src/
│   │   │   ├── screens/     # Screen components
│   │   │   ├── components/  # Reusable components
│   │   │   ├── navigation/  # Navigation setup
│   │   │   ├── services/    # API services
│   │   │   └── hooks/       # Custom hooks
│   │   ├── app.json         # Expo configuration
│   │   └── package.json
│   └── api/                 # Node.js backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   ├── models/      # Database models
│       │   ├── middleware/  # Express middleware
│       │   └── utils/       # Utility functions
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── shared/              # Shared utilities and types
│   │   ├── src/
│   │   │   ├── types/       # Common TypeScript types
│   │   │   ├── utils/       # Shared utility functions
│   │   │   └── constants/   # Application constants
│   │   └── package.json
│   ├── ui/                  # Shared UI components
│   │   ├── src/
│   │   │   └── components/  # Reusable UI components
│   │   └── package.json
│   └── database/            # Database schemas and migrations
│       ├── migrations/      # SQL migration files
│       ├── schemas/         # Database schema definitions
│       └── package.json
├── docker-compose.yml       # Local development environment
├── turbo.json              # Turborepo configuration
└── package.json            # Root package.json
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
- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- Expo CLI (for mobile development)
- Redis (or use Docker)
- SQLite (lightweight, file-based database)

### Environment Variables
Create `.env` files in each app directory:

**apps/api/.env**
```env
DATABASE_PATH=./portfolio.db  # SQLite database file
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
   cd stock-crypto-tracker
   npm install
   ```

2. **Start development services**
   ```bash
   # Start Redis only
   docker-compose up -d redis
   
   # Initialize SQLite database
   npm run db:init
   
   # Start all applications
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

### Web App (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Docker)
```bash
# Build and deploy to your server
docker build -t stock-tracker-api ./apps/api
docker run -p 3001:3001 --env-file .env stock-tracker-api
```

### Database
- **SQLite**: Simple file-based database, perfect for personal use
- **Backup**: Just copy the `portfolio.db` file

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
  symbol: string;           // e.g., "AAPL", "BTC"
  name: string;            // e.g., "Apple Inc.", "Bitcoin"
  type: 'stock' | 'crypto';
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
- **SQLite Database**: Lightweight, file-based storage
- **Free APIs Only**: Designed to work within free tier limits
- **Smart Caching**: Minimizes API calls while keeping data fresh
- **Hourly Updates**: Background updates + manual refresh on app open

### Development Considerations
- **API Rate Limits**: 25 stock calls/day max (Alpha Vantage)
- **Data Backup**: Copy `portfolio.db` file for backup
- **Environment Variables**: Keep API keys secure
- **Mobile Testing**: Use Expo for easy iOS testing