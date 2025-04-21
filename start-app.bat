@echo off
echo Starting KidsMentor Education Portal...

REM Start the backend server
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --reload"

REM Wait a moment for the backend to initialize
timeout /t 3

REM Start the frontend development server
start cmd /k "npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit all servers...
pause>nul

REM Kill all related processes
taskkill /f /im cmd.exe

exit 