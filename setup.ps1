# Certificate Generator Setup Script
# Run this script to set up your development environment

Write-Host "=== Certificate Generator Setup ===" -ForegroundColor Cyan

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Install root dependencies
Write-Host "`nInstalling root dependencies..." -ForegroundColor Yellow
npm install

# Backend setup
Write-Host "`n=== Backend Setup ===" -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

# Frontend setup
Write-Host "`n=== Frontend Setup ===" -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# Create .env files
Write-Host "`nCreating environment files..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env" -ErrorAction SilentlyContinue
    if (-not (Test-Path "backend\.env")) {
        @"
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
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    }
    Write-Host "✓ Backend .env created" -ForegroundColor Green
} else {
    Write-Host "✓ Backend .env already exists" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    "VITE_API_URL=http://localhost:5001" | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✓ Frontend .env created" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend .env already exists" -ForegroundColor Green
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Set up PostgreSQL database" -ForegroundColor White
Write-Host "   createdb certificate_generator" -ForegroundColor Gray
Write-Host "2. Configure backend/.env with your settings" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both frontend and backend" -ForegroundColor White
Write-Host "`nDocumentation: See README.md and QUICKSTART.md" -ForegroundColor Cyan

