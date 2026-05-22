#!/bin/bash

# Analytics Feature Installation Script

echo "========================================="
echo "SiteBeacon Analytics Feature Setup"
echo "========================================="
echo ""

# Backend Setup
echo "📦 Installing backend dependencies..."
cd server
npm install chart.js chartjs-node-canvas
echo "✅ Backend dependencies installed"
echo ""

# Frontend Setup
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install chart.js react-chartjs-2
echo "✅ Frontend dependencies installed"
echo ""

echo "========================================="
echo "✅ Analytics feature setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Backend:  npm run dev"
echo "2. Frontend: npm run dev"
echo ""
echo "📚 For documentation, see ANALYTICS_FEATURE.md"
