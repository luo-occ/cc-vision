#!/bin/bash

# Build script for web app deployment
echo "🚀 Building web app for Vercel..."

# Install dependencies for this app only
echo "📦 Installing dependencies..."
npm install

# Build the shared types package first (copy manually to avoid workspace issues)
echo "🔧 Building shared types..."
mkdir -p node_modules/@portfolio
cp -r ../../packages/shared node_modules/@portfolio/

# Build the web app
echo "🔧 Building Next.js app..."
npm run build

echo "✅ Web app build completed!"
