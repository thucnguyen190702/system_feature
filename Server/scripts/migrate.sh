#!/bin/bash

# Database Migration Script
# Handles running, reverting, and generating migrations

set -e

echo "========================================="
echo "Friend System Migration Manager"
echo "========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Run 'npm run setup:env' first"
    exit 1
fi

# Show menu
echo "Select an option:"
echo "1) Run pending migrations"
echo "2) Revert last migration"
echo "3) Show migration status"
echo "4) Generate new migration"
echo "5) Verify schema"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        print_info "Running pending migrations..."
        npm run migration:run
        print_info "Migrations completed ✓"
        ;;
    2)
        print_warning "This will revert the last migration!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Reverting last migration..."
            npm run migration:revert
            print_info "Migration reverted ✓"
        else
            print_info "Cancelled"
        fi
        ;;
    3)
        print_info "Checking migration status..."
        npm run migration:show
        ;;
    4)
        read -p "Enter migration name: " migration_name
        if [ -z "$migration_name" ]; then
            print_error "Migration name cannot be empty!"
            exit 1
        fi
        print_info "Generating migration: $migration_name"
        npm run migration:generate -- -n "$migration_name"
        print_info "Migration generated ✓"
        ;;
    5)
        print_info "Verifying database schema..."
        npm run verify:schema
        print_info "Schema verification completed ✓"
        ;;
    6)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_info "========================================="
print_info "Operation completed successfully! ✓"
print_info "========================================="
