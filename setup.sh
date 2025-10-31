#!/bin/bash

# Certificate Generator Setup Script
# Run this script to set up your development environment

echo "=== Certificate Generator Setup ==="

# Check Node.js
echo ""
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Install root dependencies
echo ""
echo "Installing root dependencies..."
npm install

# Backend setup
echo ""
echo "=== Backend Setup ==="
cd backend
npm install
cd ..

# Frontend setup
echo ""
echo "=== Frontend Setup ==="
cd frontend
npm install
cd ..

# Create .env files
echo ""
echo "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << 'EOF'
# Server
PORT=5001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=certificate_generator
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Frontend
FRONTEND_URL=http://localhost:3000

# Verification
VERIFICATION_SECRET=your-verification-secret-change-this
EOF
    echo "✓ Backend .env created"
else
    echo "✓ Backend .env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:5001" > frontend/.env
    echo "✓ Frontend .env created"
else
    echo "✓ Frontend .env already exists"
fi

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "   createdb certificate_generator"
echo "2. Configure backend/.env with your settings"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "Documentation: See README.md and QUICKSTART.md"

