# ==========================================
# GoBeyondFit - Script Startup Simple
# ==========================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "GoBeyondFit - Startup Optimise" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Etape 1 - Arret
Write-Host "[1/4] Arret des conteneurs existants..." -ForegroundColor Yellow
docker-compose down
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# Etape 2 - Nettoyage
Write-Host "on skip le nettoyage la data est précieuse" -ForegroundColor Yellow
# Etape 3 - Build
Write-Host "[3/4] Construction des images Docker..." -ForegroundColor Yellow
docker-compose build --no-cache
Write-Host ""
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# Etape 4 - Start
Write-Host "[4/4] Demarrage des services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# Attendre le demarrage
Write-Host "Attente du demarrage (5 secondes)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Afficher le status
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Status des services:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Utilisation des ressources:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Container}}`t{{.MemUsage}}`t{{.CPUPerc}}"
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "SUCCÈS - Services lancees!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend  : http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend   : http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs  : http://localhost:3000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  Voir les logs        : docker-compose logs -f"
Write-Host "  Arreter les services : docker-compose down"
Write-Host "  Monitoring ressources : docker stats"
Write-Host ""
