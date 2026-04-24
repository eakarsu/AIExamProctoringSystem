#!/bin/bash

# ============================================
# AI Exam Proctoring System - Startup Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Print banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                              ║${NC}"
echo -e "${CYAN}║     ${GREEN}AI Exam Proctoring System${CYAN}                ║${NC}"
echo -e "${CYAN}║                                              ║${NC}"
echo -e "${CYAN}║     ${YELLOW}Frontend:${NC}  http://localhost:3000${CYAN}         ║${NC}"
echo -e "${CYAN}║     ${YELLOW}Backend:${NC}   http://localhost:3001${CYAN}         ║${NC}"
echo -e "${CYAN}║                                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down AI Exam Proctoring System...${NC}"
    # Kill child processes
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    # Kill any remaining processes on our ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}All processes stopped. Goodbye!${NC}"
    exit 0
}

# Set trap for cleanup on exit
trap cleanup SIGINT SIGTERM EXIT

# ----------------------------------------
# Step 1: Load environment variables
# ----------------------------------------
echo -e "${BLUE}[1/8]${NC} Loading environment variables..."
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
    echo -e "  ${GREEN}✓${NC} .env file loaded"
else
    echo -e "  ${RED}✗${NC} .env file not found at $PROJECT_DIR/.env"
    echo -e "  ${YELLOW}Using default configuration${NC}"
fi

# ----------------------------------------
# Step 2: Kill existing processes on ports
# ----------------------------------------
echo -e "${BLUE}[2/8]${NC} Clearing ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Ports cleared"

# ----------------------------------------
# Step 3: Check PostgreSQL
# ----------------------------------------
echo -e "${BLUE}[3/8]${NC} Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} PostgreSQL is running"
else
    echo -e "  ${YELLOW}!${NC} PostgreSQL is not running. Attempting to start..."
    if command -v brew &>/dev/null; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    elif command -v pg_ctl &>/dev/null; then
        pg_ctl -D /usr/local/var/postgres start 2>/dev/null || pg_ctl -D /var/lib/postgresql/data start 2>/dev/null || true
    else
        echo -e "  ${RED}✗${NC} Could not start PostgreSQL automatically. Please start it manually."
        exit 1
    fi
    # Wait for PostgreSQL to be ready
    sleep 2
    if pg_isready -q 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} PostgreSQL started successfully"
    else
        echo -e "  ${RED}✗${NC} Failed to start PostgreSQL. Please start it manually."
        exit 1
    fi
fi

# ----------------------------------------
# Step 4: Create database if needed
# ----------------------------------------
echo -e "${BLUE}[4/8]${NC} Ensuring database exists..."
createdb exam_proctoring 2>/dev/null || true
echo -e "  ${GREEN}✓${NC} Database 'exam_proctoring' ready"

# ----------------------------------------
# Step 5: Install backend dependencies
# ----------------------------------------
echo -e "${BLUE}[5/8]${NC} Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}✓${NC} Backend dependencies installed"

# ----------------------------------------
# Step 6: Start backend with nodemon
# ----------------------------------------
echo -e "${BLUE}[6/8]${NC} Starting backend server with hot reload (nodemon)..."
cd "$PROJECT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!
echo -e "  ${GREEN}✓${NC} Backend starting on http://localhost:3001 (PID: $BACKEND_PID)"

# Wait for backend to initialize and create tables
echo -e "  ${YELLOW}...${NC} Waiting for backend to initialize..."
sleep 3

# ----------------------------------------
# Step 7: Run seed SQL file
# ----------------------------------------
echo -e "${BLUE}[7/8]${NC} Seeding database..."
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-exam_proctoring}"

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$PROJECT_DIR/seed.sql" -q 2>&1 | tail -5 || true
echo -e "  ${GREEN}✓${NC} Database seeded successfully"

# ----------------------------------------
# Step 8: Install and start frontend
# ----------------------------------------
echo -e "${BLUE}[8/8]${NC} Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}✓${NC} Frontend dependencies installed"

echo -e "${BLUE}     ${NC} Starting frontend dev server..."
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=3000 npm start &
FRONTEND_PID=$!
echo -e "  ${GREEN}✓${NC} Frontend starting on http://localhost:3000 (PID: $FRONTEND_PID)"

# ----------------------------------------
# Ready!
# ----------------------------------------
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  System is starting up!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:3000"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:3001"
echo -e "  ${CYAN}API Health:${NC} http://localhost:3001/api/health"
echo ""
echo -e "  ${YELLOW}Default Login:${NC}"
echo -e "    Email:    admin@examproctor.com"
echo -e "    Password: admin123"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait
