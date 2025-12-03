#!/bin/bash
# Quick Docker commands for GoBeyondFit

# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart postgres

# View logs
docker compose logs -f frontend     # Frontend logs
docker compose logs -f backend      # Backend logs
docker compose logs -f postgres     # Database logs

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# View running containers
docker compose ps

# Access database
# URL: http://localhost:8080
# Server: postgres
# User: gobeyondfit
# Pass: gobeyondfit_secure_password
# DB: gobeyondfit_db
