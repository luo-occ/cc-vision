#!/bin/bash

# Vercel Deployment Script for Portfolio Tracker

set -e

echo "🚀 Preparing for Vercel deployment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project
echo "🔨 Building project..."
pnpm build

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local from template. Please update with your actual values."
fi

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for Vercel deployment:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel"
echo "4. Set up environment variables in Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - REDIS_URL"
echo "   - API keys for external services"
echo ""
echo "🎯 Your project is ready for Vercel deployment!"