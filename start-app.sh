#!/bin/bash

echo "Starting KidsMentor Education Portal..."

# Start the backend server
echo "Starting backend server..."
(cd backend && source venv/bin/activate && uvicorn main:app --reload) &
BACKEND_PID=$!

# Wait a moment for the backend to initialize
sleep 3

# Start the frontend development server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to exit all servers..."

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait 