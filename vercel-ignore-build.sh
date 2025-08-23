#!/bin/bash

# This script tells Vercel when to skip builds for the cc-vision-api project
# Skip if only web app or mobile files changed

echo "🔍 Checking if cc-vision-api build should be skipped..."

# Check if any API-related files changed
if git diff --quiet HEAD^ HEAD -- api/ apps/api/ packages/shared/; then
  echo "🚫 No API changes detected, skipping cc-vision-api build"
  exit 0
else
  echo "✅ API changes detected, proceeding with cc-vision-api build"
  exit 1
fi
