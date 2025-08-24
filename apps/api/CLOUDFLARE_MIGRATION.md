# 🚀 Cloudflare Workers Migration Guide

This guide explains the migration from PostgreSQL + Redis to Cloudflare D1 + KV.

## 📊 Migration Overview

### Before (PostgreSQL + Redis)
- **Database**: PostgreSQL on localhost:5432
- **Cache**: Redis on localhost:6379
- **Deployment**: Vercel Functions
- **Complexity**: Multiple services to manage

### After (Cloudflare D1 + KV)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Cache**: Cloudflare KV (global edge cache)
- **Deployment**: Cloudflare Workers
- **Complexity**: Serverless, no infrastructure to manage

## 🎯 Benefits of Migration

### Performance
- ⚡ **Faster cold starts**: Workers start in <1ms
- 🌍 **Global edge network**: 200+ locations worldwide
- 🚀 **Edge caching**: KV data cached at edge locations

### Cost
- 💰 **Lower operational costs**: No server maintenance
- 🆓 **Generous free tier**: 100K requests/day
- 📊 **Transparent pricing**: Pay per request

### Simplicity
- 🔧 **No infrastructure**: Fully managed platform
- 📈 **Auto-scaling**: Handles traffic spikes automatically
- 🛡️ **Built-in security**: DDoS protection included

## 📁 New File Structure

```
src/
├── cloudflare/
│   ├── models/
│   │   └── d1Database.js          # D1 database operations
│   └── services/
│       ├── kvCacheService.js      # KV cache service
│       └── cloudflareEnhancedPriceService.js  # Price service with KV
├── handlers/
│   ├── health.js                  # Updated health check
│   ├── accounts.js                # Updated with D1 support
│   └── portfolio.js               # Updated with D1 + KV
├── worker.js                      # Main Worker entry point
└── setup-cloudflare.sh           # Setup script
```

## 🔄 Data Migration Mapping

### Database Schema Migration

| PostgreSQL | Cloudflare D1 | Changes |
|------------|---------------|---------|
| `accounts` table | `accounts` table | Column names converted to snake_case |
| `holdings` table | `holdings` table | Same structure, optimized indexes |
| `pg` connection | D1 prepared statements | Different query syntax |

### Cache Migration

| Redis | Cloudflare KV | Changes |
|-------|---------------|---------|
| `price:SYMBOL` | `price:SYMBOL` | Same key format |
| `historical:*` | `historical:*` | Same key format |
| `search:*` | `search:*` | Same key format |
| `setEx()` | `put(key, value, {expirationTtl})` | Different API |
| `get()` | `get(key, 'json')` | Auto JSON parsing |

## 🛠️ Setup Instructions

### 1. Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. Automated Setup

```bash
# Run the setup script
./setup-cloudflare.sh
```

This script will:
- Create D1 database (`portfolio-db`)
- Create KV namespace (`PORTFOLIO_KV`)
- Update `wrangler.toml` with actual IDs
- Initialize database tables
- Insert default account

### 3. Manual Setup (Alternative)

If the script doesn't work, you can set up manually:

```bash
# Create D1 database
wrangler d1 create portfolio-db

# Create KV namespace
wrangler kv:namespace create "PORTFOLIO_KV"
wrangler kv:namespace create "PORTFOLIO_KV" --preview

# Update wrangler.toml with the returned IDs
# Then initialize database:
wrangler d1 execute portfolio-db --command "CREATE TABLE accounts..."
```

## 🚀 Deployment Commands

```bash
# Local development
npm run cf:dev

# Deploy to staging
npm run cf:deploy:staging

# Deploy to production
npm run cf:deploy:prod
```

## 🔍 API Endpoints

All endpoints remain the same:

- `GET /api/health` - Health check
- `GET /api/accounts` - Get accounts
- `POST /api/accounts` - Create account
- `GET /api/portfolio` - Get portfolio
- `POST /api/portfolio` - Add holding

## 📊 Key Differences

### Database Operations

**Before (PostgreSQL):**
```javascript
const result = await client.query('SELECT * FROM accounts WHERE id = $1', [id]);
```

**After (D1):**
```javascript
const result = await db.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first();
```

### Cache Operations

**Before (Redis):**
```javascript
await redis.setEx(`price:${symbol}`, 300, JSON.stringify(price));
const cached = await redis.get(`price:${symbol}`);
```

**After (KV):**
```javascript
await kv.put(`price:${symbol}`, JSON.stringify(price), { expirationTtl: 300 });
const cached = await kv.get(`price:${symbol}`, 'json');
```

## 🔧 Configuration

### Environment Variables

Update your environment variables:

```bash
# Remove (no longer needed)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Keep (still needed for external APIs)
ALPHA_VANTAGE_API_KEY=your_key
COINGECKO_API_KEY=your_key
```

### Frontend Updates

Update your web app's API URL:

```javascript
// In apps/web/vercel.json or environment
"NEXT_PUBLIC_API_URL": "https://cc-vision-api-prod.your-subdomain.workers.dev"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database not found**
   ```bash
   # Check if database exists
   wrangler d1 list
   
   # Re-run setup if needed
   ./setup-cloudflare.sh
   ```

2. **KV namespace not found**
   ```bash
   # Check if namespace exists
   wrangler kv:namespace list
   
   # Verify IDs in wrangler.toml
   ```

3. **Import errors**
   ```bash
   # Ensure all imports use relative paths
   import { D1Database } from '../cloudflare/models/d1Database.js';
   ```

### Debugging

```bash
# View real-time logs
wrangler tail cc-vision-api-prod

# Check D1 data
wrangler d1 execute portfolio-db --command "SELECT * FROM accounts;"

# Check KV data (limited)
wrangler kv:key list --binding=PORTFOLIO_KV
```

## 📈 Performance Monitoring

### Cloudflare Analytics

- Visit Cloudflare Dashboard
- Go to Workers & Pages
- Select your worker
- View analytics and logs

### Health Checks

The health endpoint now includes:
- Database connectivity
- KV cache status
- API provider status

```bash
curl https://your-worker.workers.dev/api/health
```

## 🔄 Rollback Plan

If needed, you can rollback by:

1. Reverting to original handlers
2. Re-enabling PostgreSQL/Redis
3. Updating deployment to use Vercel

The original files are preserved, so rollback is straightforward.

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [KV Storage Docs](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🎉 Success Metrics

After migration, you should see:
- ✅ Faster API response times
- ✅ Better global performance
- ✅ Lower operational costs
- ✅ Simpler deployment process
- ✅ Better scalability
