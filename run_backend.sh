#!/bin/bash
# Backend Runner Script for AI Chat Portal
# This script starts the Django development server

echo "🚀 Starting Backend Development Server..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
echo "📦 Installing/Updating dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Migrations failed, but continuing..."
fi

echo ""
echo "✅ Starting Django on http://localhost:8000"
echo ""

# Start the Django development server
python manage.py runserver
