@echo off
setlocal enabledelayedexpansion

echo ===============================
echo   LIME Application Startup
echo ===============================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

:menu
echo Select mode:
echo 1) Production (optimized, port 5174)
echo 2) Development (hot-reload, port 5173)
echo 3) Stop all services
echo 4) View logs
echo 5) Clean up (remove containers and images)
echo 6) Exit
echo.

set /p choice="Enter choice [1-6]: "

if "%choice%"=="1" goto production
if "%choice%"=="2" goto development
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto cleanup
if "%choice%"=="6" goto end

echo [ERROR] Invalid choice
goto menu

:production
echo.
echo Starting in PRODUCTION mode...
docker-compose up --build -d
echo.
echo [OK] Application started!
echo.
echo Access the application:
echo   Frontend:    http://localhost:5174
echo   Backend API: http://localhost:3000/api/v1
echo   Widget JS:   http://localhost:5174/widget/lime-widget.iife.js
echo.
echo Default credentials:
echo   Email:    lime@example.com
echo   Password: 123456
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
pause
goto end

:development
echo.
echo Starting in DEVELOPMENT mode...
docker-compose -f docker-compose.dev.yml up --build -d
echo.
echo [OK] Application started!
echo.
echo Access the application:
echo   Frontend:    http://localhost:5173
echo   Backend API: http://localhost:3000/api/v1
echo.
echo Default credentials:
echo   Email:    lime@example.com
echo   Password: 123456
echo.
echo To view logs: docker-compose -f docker-compose.dev.yml logs -f
echo To stop:      docker-compose -f docker-compose.dev.yml down
pause
goto end

:stop
echo.
echo Stopping all services...
docker-compose down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul
echo [OK] All services stopped
pause
goto end

:logs
echo.
echo Select which logs to view:
echo 1) Production logs
echo 2) Development logs
echo.
set /p log_choice="Enter choice [1-2]: "

if "%log_choice%"=="1" (
    docker-compose logs -f
) else if "%log_choice%"=="2" (
    docker-compose -f docker-compose.dev.yml logs -f
) else (
    echo [ERROR] Invalid choice
)
goto end

:cleanup
echo.
echo Cleaning up...
echo This will remove all containers and images for LIME application
set /p confirm="Are you sure? (y/N): "

if /i "%confirm%"=="y" (
    docker-compose down --rmi all -v 2>nul
    docker-compose -f docker-compose.dev.yml down --rmi all -v 2>nul
    echo [OK] Cleanup complete
) else (
    echo Cancelled
)
pause
goto end

:end
endlocal

