#!/bin/bash

# Environment Setup Script
# This script helps set up the environment for the Friend System

set -e

echo "========================================="
echo "Friend System Environment Setup"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env already exists
if [ -f .env ]; then
    print_warning ".env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Keeping existing .env file"
        exit 0
    fi
fi

# Copy from example
print_info "Creating .env from .env.example..."
cp .env.example .env

# Generate JWT secret
print_info "Generating JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

# Update .env file with generated secret
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
fi

print_info "JWT secret generated and updated ✓"

# Prompt for database configuration
echo ""
print_info "Database Configuration"
read -p "Database name [friend_system]: " DB_NAME
DB_NAME=${DB_NAME:-friend_system}

read -p "Database user [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Database password [postgres]: " DB_PASSWORD
echo
DB_PASSWORD=${DB_PASSWORD:-postgres}

read -p "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Update .env with database config
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/DB_NAME=friend_system/DB_NAME=$DB_NAME/" .env
    sed -i '' "s/DB_USER=postgres/DB_USER=$DB_USER/" .env
    sed -i '' "s/DB_PASSWORD=postgres/DB_PASSWORD=$DB_PASSWORD/" .env
    sed -i '' "s/DB_HOST=localhost/DB_HOST=$DB_HOST/" .env
    sed -i '' "s/DB_PORT=5432/DB_PORT=$DB_PORT/" .env
else
    sed -i "s/DB_NAME=friend_system/DB_NAME=$DB_NAME/" .env
    sed -i "s/DB_USER=postgres/DB_USER=$DB_USER/" .env
    sed -i "s/DB_PASSWORD=postgres/DB_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s/DB_HOST=localhost/DB_HOST=$DB_HOST/" .env
    sed -i "s/DB_PORT=5432/DB_PORT=$DB_PORT/" .env
fi

print_info "Database configuration updated ✓"

# Redis configuration (optional)
echo ""
read -p "Do you want to configure Redis? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Redis host [localhost]: " REDIS_HOST
    REDIS_HOST=${REDIS_HOST:-localhost}
    
    read -p "Redis port [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/REDIS_HOST=localhost/REDIS_HOST=$REDIS_HOST/" .env
        sed -i '' "s/REDIS_PORT=6379/REDIS_PORT=$REDIS_PORT/" .env
    else
        sed -i "s/REDIS_HOST=localhost/REDIS_HOST=$REDIS_HOST/" .env
        sed -i "s/REDIS_PORT=6379/REDIS_PORT=$REDIS_PORT/" .env
    fi
    
    print_info "Redis configuration updated ✓"
fi

echo ""
print_info "========================================="
print_info "Environment setup completed! ✓"
print_info "========================================="
print_info "Configuration saved to .env"
print_info ""
print_info "Next steps:"
print_info "1. Review and adjust .env file if needed"
print_info "2. Install dependencies: npm install"
print_info "3. Run migrations: npm run migration:run"
print_info "4. Start the server: npm run dev"
print_info "========================================="
