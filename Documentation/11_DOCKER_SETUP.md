# Docker Setup Guide for GoBeyondFit

## Quick Start

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose v3.8 or higher
- Supabase project setup (for authentication)

### 1. Environment Configuration

```bash
# Copy the Docker environment file
cp .env.docker .env
```

Then edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Start Docker Compose

**Development Mode (with live reload):**
```bash
docker-compose up -d
```

**With logs visible:**
```bash
docker-compose up
```

**Build and start fresh:**
```bash
docker-compose up --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Database Admin**: http://localhost:8080 (Adminer - development only)

### 4. Database Management

**Run Prisma Migrations:**
```bash
docker-compose exec backend npx prisma migrate deploy
```

**View Database:**
```bash
docker-compose exec backend npx prisma studio
```

**Or use Adminer UI:**
Navigate to http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: gobeyondfit
- Password: gobeyondfit_secure_password
- Database: gobeyondfit_db

### Common Commands

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove volumes (WARNING: loses data):**
```bash
docker-compose down -v
```

**View logs:**
```bash
docker-compose logs -f
```

**View specific service logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Execute command in container:**
```bash
docker-compose exec backend npx prisma migrate status
docker-compose exec frontend npm run build
```

**Rebuild specific service:**
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

## Architecture

### Services

1. **PostgreSQL Database**
   - Image: `postgres:15-alpine`
   - Port: 5432
   - Data persisted in `postgres_data` volume
   - Healthcheck: 5s interval

2. **NestJS Backend**
   - Builds from `backend/Dockerfile`
   - Port: 3000
   - Depends on: PostgreSQL
   - Environment: Development (hot reload via volumes)
   - Healthcheck: Curl to /api/docs

3. **Next.js Frontend**
   - Builds from `frontend/Dockerfile`
   - Port: 3001
   - Depends on: Backend
   - Environment: Development (hot reload via volumes)
   - Healthcheck: Curl to home page

4. **Adminer (Optional)**
   - Image: `adminer:latest`
   - Port: 8080
   - Profile: `dev` (only runs with `--profile dev`)

### Networks

All services connected via `gobeyondfit-network` bridge network, enabling container-to-container communication using service names as hostnames.

### Volumes

- **postgres_data**: Persistent PostgreSQL data
- **Backend src**: Live code updates (`./backend/src:/app/src`)
- **Frontend app, lib, components**: Live code updates
- **node_modules**: Isolated per-container dependencies

## Environment Variables

### Backend

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/dbname

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=your_secret

# Email
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Frontend
FRONTEND_URL=http://localhost:3001
```

### Frontend

```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Production Deployment

### Build for Production

```bash
docker-compose -f docker-compose.yml build --no-cache
```

### Use Production Compose File

Create `docker-compose.prod.yml` based on `docker-compose.yml` with:
- No volumes for source code
- No Adminer service
- Resource limits
- Health checks with longer timeouts
- Different environment variables

### Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### "Port already in use"
```bash
# Find and kill process on port
lsof -i :3000
kill -9 <PID>

# Or change port in .env
BACKEND_PORT=3000
FRONTEND_PORT=3001
```

### Database connection errors
```bash
# Check postgres healthcheck
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres
```

### Backend failing to start
```bash
# Check backend logs
docker-compose logs backend

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Restart backend
docker-compose restart backend
```

### Frontend build errors
```bash
# Clear Next.js cache
docker-compose exec frontend rm -rf .next

# Rebuild
docker-compose up --build frontend
```

### Out of disk space
```bash
# Remove unused images and volumes
docker system prune -a

# Remove dangling volumes
docker volume prune
```

## Development Workflow

1. **Make code changes** (files automatically hot-reload in containers)
2. **Check logs** for errors: `docker-compose logs -f`
3. **Test API** at http://localhost:3000/api/docs
4. **Test Frontend** at http://localhost:3001
5. **Database changes**:
   - Create migration: `docker-compose exec backend npx prisma migrate dev --name descriptive_name`
   - Apply migrations: `docker-compose exec backend npx prisma migrate deploy`

## Performance Tips

1. **Use .dockerignore** to exclude unnecessary files from build context
2. **Use multi-stage builds** (already implemented in Dockerfiles)
3. **Pin image versions** (postgres:15-alpine, node:18-alpine)
4. **Use alpine images** for smaller size
5. **Set resource limits** in production compose file

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**:
- Change all default passwords in `.env`
- Use strong JWT_SECRET
- Store secrets in Docker Secrets or external secret manager
- Don't commit `.env` to git (already in .gitignore)
- Use HTTPS with proper certificates
- Set proper CORS_ORIGIN values
- Configure firewall rules

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS with Docker](https://docs.nestjs.com/deployment/docker)
- [Next.js Production Build](https://nextjs.org/docs/advanced-features/production-build)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
