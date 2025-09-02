#!/bin/bash

echo "🐱 Starting Cat Tracker Application..."

# Kill any existing processes on ports 3001 and 5173
echo "Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend
echo "Starting backend server on port 3001..."
cd backend
npx tsx src/server.ts &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 2

# Start frontend
echo "Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Cat Tracker is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait