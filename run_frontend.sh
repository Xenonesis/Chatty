#!/bin/bash
# Frontend Runner Script for AI Chat Portal
# This script starts the Next.js development server

echo "🚀 Starting Frontend Development Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Starting Next.js on http://localhost:3000"
echo ""

# Start the Next.js development server
npm run dev
