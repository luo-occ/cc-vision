#!/bin/bash

# Vercel build script for cc-vision project
# This script builds both the API and web app

echo "🚀 Starting Vercel build for cc-vision..."

# Install dependencies for the entire project
echo "📦 Installing dependencies..."
npm install

# Build the shared package first
echo "🔧 Building shared package..."
cd packages/shared && npm run build && cd ../..

# Build the API
echo "🔧 Building API..."
cd apps/api && npm run build && cd ../..

# Build the web app
echo "🔧 Building web app..."
cd apps/web && npm run build && cd ../..

echo "✅ Build completed successfully!"


