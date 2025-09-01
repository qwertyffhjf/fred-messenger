@echo off
echo ========================================
echo    LGMU Messenger - Quick Start
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not installed or not in PATH
    echo Please install MongoDB 6.0+ or use Docker
    echo.
    set /p use_docker="Use Docker instead? (y/n): "
    if /i "%use_docker%"=="y" (
        echo Starting with Docker...
        docker-compose up -d
        echo.
        echo Docker services started!
        echo Server: http://localhost:5000
        echo Client: http://localhost:3000
        echo MongoDB: localhost:27017
        echo.
        pause
        exit /b 0
    )
)

echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Creating environment file...
if not exist .env (
    copy env.example .env
    echo Created .env file from template
    echo Please review and update the configuration
)

echo.
echo Starting MongoDB...
start "MongoDB" mongod --dbpath ./data/db

echo Waiting for MongoDB to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting LGMU Messenger...
echo.
echo Starting server on port 5000...
start "LGMU Server" cmd /k "npm run server:dev"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting client on port 3000...
start "LGMU Client" cmd /k "npm run client:dev"

echo.
echo ========================================
echo    LGMU Messenger is starting...
echo ========================================
echo.
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo MongoDB: localhost:27017
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3000

echo.
echo Application opened in browser!
echo.
echo To stop all services, close the command windows
echo or press Ctrl+C in each terminal
echo.
pause
