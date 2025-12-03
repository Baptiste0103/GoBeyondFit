#!/bin/bash

# Script de démarrage optimisé pour GoBeyondFit
# Nettoie les ressources Docker inutilisées et redémarre l'application

set -e

echo "=========================================="
echo "GoBeyondFit - Startup Optimisé"
echo "=========================================="
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Nettoyer les ressources inutilisées
echo -e "${YELLOW}[1/5] Nettoyage des ressources Docker inutilisées...${NC}"
docker system prune -f --volumes > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Nettoyage terminé${NC}"
echo ""

# 2. Arrêter les conteneurs existants
echo -e "${YELLOW}[2/5] Arrêt des conteneurs existants...${NC}"
docker-compose down > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Conteneurs arrêtés${NC}"
echo ""

# 3. Reconstruire les images (cache mode)
echo -e "${YELLOW}[3/5] Reconstruction des images Docker avec optimisations...${NC}"
docker-compose build
echo -e "${GREEN}✓ Images construites${NC}"
echo ""

# 4. Démarrer les services
echo -e "${YELLOW}[4/5] Démarrage des services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services démarrés${NC}"
echo ""

# 5. Afficher le statut
echo -e "${YELLOW}[5/5] Vérification du statut...${NC}"
sleep 10  # Attendre le démarrage initial

echo ""
echo "=========================================="
echo "Statut des services :"
echo "=========================================="
docker-compose ps
echo ""

echo "=========================================="
echo "Utilisation des ressources :"
echo "=========================================="
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
echo ""

echo "=========================================="
echo -e "${GREEN}✓ Démarrage terminé avec succès !${NC}"
echo "=========================================="
echo ""
echo "URLs d'accès :"
echo "  - Frontend  : http://localhost:3001"
echo "  - Backend   : http://localhost:3000"
echo "  - API Docs  : http://localhost:3000/api/docs"
echo ""
echo "Pour voir les logs en direct :"
echo "  docker-compose logs -f"
echo ""
echo "Pour arrêter les services :"
echo "  docker-compose down"
echo ""
echo "Pour nettoyer complètement :"
echo "  docker-compose down -v"
echo ""
