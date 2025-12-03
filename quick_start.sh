#!/bin/bash
# Quick Start Script pour GoBeyondFit Auth
# Utilisation: bash quick_start.sh

echo "🚀 GoBeyondFit - Authentication Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Install Backend Dependencies
echo -e "${BLUE}[1/4]${NC} Installing backend dependencies..."
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

# 2. Install Frontend Dependencies
echo -e "${BLUE}[2/4]${NC} Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

# 3. Check .env files
echo -e "${BLUE}[3/4]${NC} Checking environment files..."
if [ -f backend/.env ]; then
    echo -e "${GREEN}✓ backend/.env found${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env not found (create it)${NC}"
fi

if [ -f frontend/.env.local ]; then
    echo -e "${GREEN}✓ frontend/.env.local found${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env.local not found${NC}"
fi
echo ""

# 4. Summary
echo -e "${BLUE}[4/4]${NC} Setup Summary:"
echo "========================================="
echo -e "${GREEN}✓ All dependencies installed${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Terminal 1 (Backend):"
echo "   cd backend && npm run start:dev"
echo ""
echo "2. Terminal 2 (Frontend):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Test the API:"
echo "   curl -X POST http://localhost:3000/auth/login"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
