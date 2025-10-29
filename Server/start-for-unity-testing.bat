@echo off
echo ========================================
echo Starting Authentication Server
echo For Unity Client Testing
echo ========================================
echo.

echo Checking if server dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Checking database connection...
echo Make sure PostgreSQL is running on port 5126
echo.

echo Starting server in development mode...
echo Server will be available at: http://localhost:3000
echo Health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
