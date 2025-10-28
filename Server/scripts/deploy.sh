#!/bin/bash

# Friend System Deployment Script
# This script handles the deployment of the Friend System server

set -e  # Exit on error

echo "========================================="
echo "Friend System Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    print_warning "Please update .env file with your configuration before continuing."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
REQUIRED_VARS=("DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set!"
        exit 1
    fi
done

print_info "Environment variables validated ✓"

# Build Docker images
print_info "Building Docker images..."
docker-compose build

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down

# Start services
print_info "Starting services..."
docker-compose up -d

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Run database migrations
print_info "Running database migrations..."
docker-compose exec -T app npm run migration:run

# Verify schema
print_info "Verifying database schema..."
docker-compose exec -T app npm run verify:schema

# Check service health
print_info "Checking service health..."
sleep 5

# Check if app is responding
if curl -f http://localhost:${PORT:-3000}/health > /dev/null 2>&1; then
    print_info "Application is healthy ✓"
else
    print_error "Application health check failed!"
    print_info "Checking logs..."
    docker-compose logs app
    exit 1
fi

# Display running containers
print_info "Running containers:"
docker-compose ps

echo ""
print_info "========================================="
print_info "Deployment completed successfully! ✓"
print_info "========================================="
print_info "Application URL: http://localhost:${PORT:-3000}"
print_info "API Documentation: http://localhost:${PORT:-3000}/api-docs"
print_info ""
print_info "Useful commands:"
print_info "  View logs:        docker-compose logs -f app"
print_info "  Stop services:    docker-compose down"
print_info "  Restart services: docker-compose restart"
print_info "========================================="
