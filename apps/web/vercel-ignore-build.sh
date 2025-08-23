#!/bin/bash

# This script tells Vercel when to skip builds for the web app project
# Skip if only API files changed

echo "🔍 Checking if web app build should be skipped..."

# Check if any web app related files changed
if git diff --quiet HEAD^ HEAD -- apps/web/ packages/shared/; then
  echo "🚫 No web app changes detected, skipping build"
  exit 0
else
  echo "✅ Web app changes detected, proceeding with build"
  exit 1
fi
