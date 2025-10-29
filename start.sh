#!/bin/bash

# LIME APPLICATION STARTUP SCRIPT

set -e

echo "=================================="
echo "✓ LIME (built by Castro)"
echo "=================================="
echo ""

# CHECK IF DOCKER IS RUNNING
if ! docker info > /dev/null 2>&1; then
    echo "× Oops... Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✓ Docker is running."
echo ""

echo "Select mode:"
echo "1) Production (optimized, port 5174)"
echo "2) Development (hot-reload, port 5173)"
echo "3) Stop all services"
echo "4) View logs"
echo "5) Clean up (remove containers and images)"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "✓ Starting in PRODUCTION mode..."
        docker-compose up --build -d
        echo ""
        echo "✓ Application started! Red Five, standing by."
        echo ""
        echo "Access the application:"
        echo "  Frontend:    http://localhost:5174"
        echo "  Backend API: http://localhost:3000/api/v1"
        echo "  Widget JS:   http://localhost:5174/lime-widget.iife.js"
        echo ""
        echo "Default credentials (Super Admin):"
        echo "  Email:    lime@example.com"
        echo "  Password: 123456"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop:      docker-compose down"
        ;;
    2)
        echo ""
        echo "✓ Starting in DEVELOPMENT mode..."
        docker-compose -f docker-compose.dev.yml up --build -d
        echo ""
        echo "✓ Application started! Red Five, standing by."
        echo ""
        echo "Access the application:"
        echo "  Frontend:    http://localhost:5173"
        echo "  Backend API: http://localhost:3000/api/v1"
        echo ""
        echo "Default credentials (Super Admin):"
        echo "  Email:    lime@example.com"
        echo "  Password: 123456"
        echo ""
        echo "To view logs: docker-compose -f docker-compose.dev.yml logs -f"
        echo "To stop:      docker-compose -f docker-compose.dev.yml down"
        ;;
    3)
        echo ""
        echo "× Stopping all services..."
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        echo "✓ All services stopped"
        ;;
    4)
        echo ""
        echo "✓ Select which logs to view:"
        echo "1) Production logs"
        echo "2) Development logs"
        echo ""
        read -p "Enter choice [1-2]: " log_choice
        case $log_choice in
            1)
                docker-compose logs -f
                ;;
            2)
                docker-compose -f docker-compose.dev.yml logs -f
                ;;
            *)
                echo "× Oops... invalid choice"
                exit 1
                ;;
        esac
        ;;
    5)
        echo ""
        echo "× Cleaning up..."
        echo "This will remove all containers and images for LIME application."
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            docker-compose down --rmi all -v 2>/dev/null || true
            docker-compose -f docker-compose.dev.yml down --rmi all -v 2>/dev/null || true
            echo "✓ Cleanup complete."
        else
            echo "× Cancelled."
        fi
        ;;
    *)
        echo "× Oops... invalid choice."
        exit 1
        ;;
esac

