@echo off
echo ========================================
echo Running End-to-End Integration Tests
echo ========================================
echo.

echo Checking if server dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting E2E tests...
echo.
call npm test -- --testPathPattern=e2e.test.ts

echo.
echo ========================================
echo E2E Tests Complete
echo ========================================
pause
