# Quick Start Script pour GoBeyondFit Auth (Windows)
# Utilisation: .\quick_start.ps1

Write-Host "🚀 GoBeyondFit - Authentication Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Install Backend Dependencies
Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
Set-Location ..
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# 2. Install Frontend Dependencies
Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Blue
Set-Location frontend
npm install
Set-Location ..
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# 3. Check .env files
Write-Host "[3/4] Checking environment files..." -ForegroundColor Blue
if (Test-Path "backend\.env") {
    Write-Host "✓ backend\.env found" -ForegroundColor Green
} else {
    Write-Host "⚠ backend\.env not found (create it)" -ForegroundColor Yellow
}

if (Test-Path "frontend\.env.local") {
    Write-Host "✓ frontend\.env.local found" -ForegroundColor Green
} else {
    Write-Host "⚠ frontend\.env.local not found" -ForegroundColor Yellow
}
Write-Host ""

# 4. Summary
Write-Host "[4/4] Setup Summary:" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "✓ All dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Terminal 1 (Backend):"
Write-Host "   cd backend; npm run start:dev"
Write-Host ""
Write-Host "2. Terminal 2 (Frontend):"
Write-Host "   cd frontend; npm run dev"
Write-Host ""
Write-Host "3. Test the API:"
Write-Host "   Invoke-WebRequest -Uri http://localhost:3000/auth/me"
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
