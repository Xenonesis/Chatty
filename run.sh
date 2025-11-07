#!/bin/bash
# Master Runner Script for AI Chat Portal
# This script starts both frontend and backend servers

echo "🚀 Starting AI Chat Portal..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "Starting Backend Server..."
./run_backend.sh &
BACKEND_PID=$!

sleep 2

# Start frontend in background
echo "Starting Frontend Server..."
./run_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
