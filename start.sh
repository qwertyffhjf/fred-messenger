#!/bin/bash

# ========================================
#    LGMU Messenger - Quick Start
# ========================================

echo "========================================"
echo "    LGMU Messenger - Quick Start"
echo "========================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    echo "Or use your package manager:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS: brew install node"
    echo "  CentOS/RHEL: sudo yum install nodejs npm"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check if MongoDB is installed
print_status "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    print_warning "MongoDB is not installed or not in PATH"
    echo "Please install MongoDB 6.0+ or use Docker"
    echo
    read -p "Use Docker instead? (y/n): " use_docker
    if [[ $use_docker =~ ^[Yy]$ ]]; then
        print_status "Starting with Docker..."
        if ! command -v docker-compose &> /dev/null; then
            print_error "Docker Compose is not installed!"
            echo "Please install Docker and Docker Compose first"
            exit 1
        fi
        
        docker-compose up -d
        if [ $? -eq 0 ]; then
            print_success "Docker services started!"
            echo
            echo "Services running:"
            echo "  Server: http://localhost:5000"
            echo "  Client: http://localhost:3000"
            echo "  MongoDB: localhost:27017"
            echo "  Prometheus: http://localhost:9090"
            echo "  Grafana: http://localhost:3001"
            echo
            echo "To stop services: docker-compose down"
            echo "To view logs: docker-compose logs -f"
            exit 0
        else
            print_error "Failed to start Docker services"
            exit 1
        fi
    fi
fi

print_success "MongoDB is available"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies!"
    exit 1
fi

print_success "Dependencies installed"

# Create environment file
print_status "Creating environment file..."
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please review and update the configuration in .env file"
    else
        print_warning "env.example not found, creating basic .env file"
        cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lgmu_messenger
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CLIENT_URL=http://localhost:3000
EOF
        print_success "Created basic .env file"
    fi
fi

# Create data directory for MongoDB
print_status "Creating data directory..."
mkdir -p ./data/db

# Start MongoDB in background
print_status "Starting MongoDB..."
mongod --dbpath ./data/db --fork --logpath ./data/mongod.log --pidfilepath ./data/mongod.pid

if [ $? -eq 0 ]; then
    print_success "MongoDB started successfully"
else
    print_warning "MongoDB might already be running or failed to start"
fi

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
sleep 5

# Check if MongoDB is responding
if ! mongosh --eval "db.adminCommand('ping')" --quiet &> /dev/null; then
    print_warning "MongoDB is not responding, but continuing..."
fi

# Start the application
echo
echo "========================================"
echo "    Starting LGMU Messenger..."
echo "========================================"
echo

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    
    # Stop MongoDB
    if [ -f ./data/mongod.pid ]; then
        print_status "Stopping MongoDB..."
        kill $(cat ./data/mongod.pid) 2>/dev/null
        rm -f ./data/mongod.pid
    fi
    
    # Kill background processes
    jobs -p | xargs -r kill
    
    print_success "All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start server in background
print_status "Starting server on port 5000..."
npm run server:dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start client in background
print_status "Starting client on port 3000..."
npm run client:dev &
CLIENT_PID=$!

# Wait for client to start
sleep 5

echo
echo "========================================"
echo "    LGMU Messenger is running!"
echo "========================================"
echo
echo "Services:"
echo "  Server: http://localhost:5000"
echo "  Client: http://localhost:3000"
echo "  MongoDB: localhost:27017"
echo
echo "Logs:"
echo "  Server: Check terminal output"
echo "  Client: Check terminal output"
echo "  MongoDB: ./data/mongod.log"
echo
echo "To stop all services, press Ctrl+C"
echo

# Open browser
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000 &
elif command -v start &> /dev/null; then
    # Windows (if running in WSL)
    start http://localhost:3000 &
fi

# Wait for user to stop
print_status "Press Ctrl+C to stop all services..."
wait
