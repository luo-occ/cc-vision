#!/bin/bash

# This script tells Vercel when to skip builds for the API project
# Skip if only web app files changed

echo "🔍 Checking if API build should be skipped..."

# Check if any API-related files changed
if git diff --quiet HEAD^ HEAD -- api/ apps/api/ packages/shared/; then
  echo "🚫 No API changes detected, skipping build"
  exit 0
else
  echo "✅ API changes detected, proceeding with build"
  exit 1
fi
