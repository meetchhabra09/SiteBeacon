#!/bin/bash

# Clean install script for SiteBeacon server

cd "$(dirname "$0")/server"

echo "🧹 Cleaning up..."
rm -rf node_modules
rm package-lock.json

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "To start the server, run:"
    echo "npm run dev"
else
    echo "❌ Installation failed"
    exit 1
fi
