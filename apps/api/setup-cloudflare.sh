#!/bin/bash

# Cloudflare Workers Setup Script
# This script helps set up D1 database and KV namespace for the portfolio API

echo "🚀 Setting up Cloudflare Workers for Portfolio API"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "✅ Wrangler CLI is available"

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔓 Please log in to Cloudflare:"
    wrangler login
else
    echo "✅ Already authenticated with Cloudflare"
fi

# Create D1 database
echo "📊 Creating D1 database..."
DB_OUTPUT=$(wrangler d1 create portfolio-db 2>&1)
if echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo "⚠️  D1 database 'portfolio-db' already exists"
    # Extract existing database ID
    DB_ID=$(wrangler d1 list | grep portfolio-db | awk '{print $2}' | head -1)
else
    # Extract database ID from creation output
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | grep -o '"[^"]*"' | tail -1 | tr -d '"')
    echo "✅ D1 database created successfully"
fi

if [ -z "$DB_ID" ]; then
    echo "❌ Failed to get database ID. Please check manually:"
    echo "   wrangler d1 list"
    exit 1
fi

echo "📊 Database ID: $DB_ID"

# Create KV namespace
echo "🗃️  Creating KV namespace..."
KV_OUTPUT=$(wrangler kv namespace create "PORTFOLIO_KV" 2>&1)
if echo "$KV_OUTPUT" | grep -q "already exists"; then
    echo "⚠️  KV namespace 'PORTFOLIO_KV' already exists"
    # Get existing namespace ID from list command
    KV_LIST=$(wrangler kv namespace list 2>&1)
    KV_ID=$(echo "$KV_LIST" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
else
    # Extract namespace ID from creation output
    KV_ID=$(echo "$KV_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ KV namespace created successfully"
fi

if [ -z "$KV_ID" ]; then
    echo "❌ Failed to get KV namespace ID. Please check manually:"
    echo "   wrangler kv namespace list"
    exit 1
fi

echo "🗃️  KV Namespace ID: $KV_ID"

# Create preview KV namespace
echo "🗃️  Creating preview KV namespace..."
KV_PREVIEW_OUTPUT=$(wrangler kv namespace create "PORTFOLIO_KV" --preview 2>&1)
KV_PREVIEW_ID=$(echo "$KV_PREVIEW_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$KV_PREVIEW_ID" ]; then
    echo "⚠️  Using same ID for preview namespace"
    KV_PREVIEW_ID=$KV_ID
fi

echo "🗃️  KV Preview Namespace ID: $KV_PREVIEW_ID"

# Update wrangler.toml with the actual IDs
echo "📝 Updating wrangler.toml with actual IDs..."

# Create backup of wrangler.toml
cp wrangler.toml wrangler.toml.backup

# Update the IDs in wrangler.toml
sed -i.tmp "s/your-kv-namespace-id/$KV_ID/g" wrangler.toml
sed -i.tmp "s/your-preview-kv-namespace-id/$KV_PREVIEW_ID/g" wrangler.toml
sed -i.tmp "s/your-database-id/$DB_ID/g" wrangler.toml

# Clean up temporary file
rm -f wrangler.toml.tmp

echo "✅ wrangler.toml updated successfully"

# Initialize database tables
echo "📊 Initializing database tables..."
cat > init_db.sql << EOF
-- Initialize portfolio database tables
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  quantity REAL NOT NULL,
  average_price REAL NOT NULL,
  asset_type TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holdings_account_id ON holdings(account_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_accounts_default ON accounts(is_default);

-- Insert default account
INSERT OR IGNORE INTO accounts (id, name, account_type, currency, is_default, is_active)
VALUES ('default-account', 'Default Account', 'SECURITIES', 'USD', 1, 1);
EOF

wrangler d1 execute portfolio-db --file=init_db.sql

echo "✅ Database tables initialized"

# Clean up
rm -f init_db.sql

echo ""
echo "🎉 Setup completed successfully!"
echo "=============================="
echo ""
echo "📋 Summary:"
echo "   • D1 Database ID: $DB_ID"
echo "   • KV Namespace ID: $KV_ID"
echo "   • Preview KV ID: $KV_PREVIEW_ID"
echo ""
echo "🚀 Next steps:"
echo "   1. Test locally: npm run cf:dev"
echo "   2. Deploy to staging: npm run cf:deploy:staging"
echo "   3. Deploy to production: npm run cf:deploy:prod"
echo ""
echo "🔗 Your API will be available at:"
echo "   • Local: http://localhost:8787"
echo "   • Production: https://cc-vision-api-prod.your-subdomain.workers.dev"
echo ""
echo "📊 Monitor your deployment:"
echo "   • Cloudflare Dashboard: https://dash.cloudflare.com"
echo "   • View logs: wrangler tail cc-vision-api-prod"
