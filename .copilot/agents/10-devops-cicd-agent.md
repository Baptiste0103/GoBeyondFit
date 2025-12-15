# 🚀 DevOps & CI/CD Agent

**Role:** Deployment & Infrastructure Expert  
**Priority:** 🟡 LOW (Currently local development)  
**Expertise Level:** Senior DevOps Engineer (10+ years)

---

## 🎯 Mission

Manage deployment pipelines, infrastructure, and CI/CD workflows. Currently focused on local Docker Compose setup, with future recommendations for production deployment.

---

## 🧠 Core Capabilities

- **Local Development** (Docker Compose, hot reload)
- **CI/CD Pipelines** (GitHub Actions, testing automation)
- **Deployment Strategies** (Blue-green, canary, rolling)
- **Infrastructure as Code** (Docker, future: Terraform/Pulumi)
- **Monitoring & Logging** (Future: Prometheus, Grafana, Sentry)
- **Database Migrations** (Prisma migrate, zero-downtime)

---

## 📦 Current Setup (Local Development)

### Docker Compose Stack

```yaml
# docker-compose.yml (current)
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gobeyondfit
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/gobeyondfit
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: pnpm dev

  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: pnpm dev

volumes:
  postgres_data:
```

### Quick Start Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build

# Run database migrations
docker-compose exec backend pnpm prisma migrate dev
```

---

## 🔮 Future: Production Deployment (Recommendations)

### Option 1: Railway (Recommended for MVP)
```
✅ Pros:
- Zero config deployment
- Automatic HTTPS
- PostgreSQL included
- Free tier available
- GitHub integration

💰 Cost: ~$20-30/month (Starter)

🚀 Setup:
1. Connect GitHub repo
2. Add DATABASE_URL (auto-provisioned)
3. Set JWT secrets
4. Deploy → Automatic
```

### Option 2: Vercel + Supabase (NO - Supabase removed)
```
❌ User explicitly removed Supabase from stack
```

### Option 3: Render (Alternative)
```
✅ Pros:
- Similar to Railway
- Good free tier
- PostgreSQL included
- Auto-deploy from GitHub

💰 Cost: ~$25/month
```

### Option 4: AWS ECS + RDS (Overkill for MVP)
```
⚠️ Pros:
- Full control
- Scalable
- Production-grade

❌ Cons:
- Complex setup
- Expensive (~$100+/month)
- DevOps overhead

📌 Recommendation: Wait until 1000+ users
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Recommended Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        working-directory: ./backend
        run: pnpm install
      
      - name: Run migrations
        working-directory: ./backend
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        working-directory: ./backend
        run: pnpm test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: pnpm install
      
      - name: Run linter
        working-directory: ./frontend
        run: pnpm lint
      
      - name: Run tests
        working-directory: ./frontend
        run: pnpm test

  deploy:
    needs: [backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Railway
        run: echo "Deploy via Railway GitHub integration"
```

---

## 🗄️ Database Migration Strategy

### Development
```bash
# Create migration
pnpm prisma migrate dev --name add_workout_template

# Reset database (WARNING: data loss)
pnpm prisma migrate reset
```

### Production (Zero-Downtime)
```bash
# 1. Deploy backward-compatible schema change
pnpm prisma migrate deploy

# 2. Deploy new application code
# (Code should handle both old and new schema)

# 3. Run data migration script (if needed)
node scripts/migrate-data.js

# 4. Clean up old columns (next deployment)
```

### Migration Checklist
```
- [ ] Backward compatible (no breaking changes)
- [ ] Tested on staging database
- [ ] Rollback plan documented
- [ ] Data migration script tested
- [ ] Indexes created before deployment
- [ ] Performance impact assessed
```

---

## 📊 Monitoring & Logging (Future)

### Recommended Tools

```
🔍 Error Tracking:
- Sentry (Frontend + Backend)
  - Free tier: 5,000 events/month
  - Cost: $26/month (Team)

📊 Application Monitoring:
- New Relic (alternative: Datadog)
  - Free tier available
  - Cost: ~$25/month

📈 Uptime Monitoring:
- UptimeRobot (free tier: 50 monitors)
  - Email/SMS alerts
  - Response time tracking

📝 Logging:
- Pino (backend) + Winston (optional)
- Log levels: error, warn, info, debug
```

---

## 🔐 Environment Variables

### Local (.env)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gobeyondfit"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
NODE_ENV="development"
PORT=3000
```

### Production (Railway/Render)
```bash
DATABASE_URL="postgresql://..." # Auto-provisioned
JWT_SECRET="<generate-with-openssl>"
JWT_REFRESH_SECRET="<generate-with-openssl>"
NODE_ENV="production"
PORT=3000
FRONTEND_URL="https://yourdomain.com"
SENTRY_DSN="https://..."
```

### Generate Secrets
```bash
# Generate JWT secrets (32+ characters)
openssl rand -base64 32
```

---

## 🚀 Quick Commands

### Local Development
```bash
# Start everything
docker-compose up -d

# Watch logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend pnpm prisma migrate dev

# Seed database
docker-compose exec backend pnpm prisma db seed
```

### Deploy to Production
```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md

I am ready to deploy to production.
Recommend the best platform (e.g. Railway vs Render)
and outline the full deployment steps for GoBeyondFit.
```

### Setup CI/CD
```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md

Create a complete GitHub Actions pipeline that:
- Runs backend and frontend tests
- Publishes coverage reports
- Deploys automatically on pushes to main (when tests pass).
```

---

## 📈 Deployment Roadmap

```
✅ Phase 1 (Current): Local Docker Compose
- Development environment
- Hot reload
- PostgreSQL local

⏸️ Phase 2 (Q1 2025): Staging on Railway
- Auto-deploy from `develop` branch
- Staging database
- Environment parity

⏸️ Phase 3 (Q2 2025): Production on Railway
- Auto-deploy from `main` branch
- Production database (backups enabled)
- Monitoring (Sentry)

⏸️ Phase 4 (Q3 2025): Scale as needed
- Evaluate AWS/GCP if > 1000 users
- CDN for frontend assets
- Redis caching layer
```

---

## 📡 ORCHESTRATION INTEGRATION

### Role in Orchestrated Workflows

**Position:** Deployment Pipeline (Specialized)  
**Pipelines:** Deployment Pipeline, Feature Pipeline (CI/CD)

### Deployment Pipeline (Complete Workflow)

**Triggered by:** Manual trigger or merge to `main` branch

**Stage 1 - Pre-Deploy Validation:**
```json
{
  "issueNumber": 78,
  "stage": 1,
  "task": "Pre-deploy checks for production deployment",
  "context": {
    "branch": "main",
    "environment": "production",
    "previousVersion": "v1.2.3",
    "newVersion": "v1.3.0"
  }
}
```

**Execution:**
1. Environment health check
2. Database backup verification
3. Security scan
4. Performance baseline
5. Comment results:

```markdown
### ✅ STAGE 1: Pre-Deploy Validation PASSED

**Agent:** @10-devops-cicd-agent  
**Environment:** Production  
**Version:** v1.3.0

#### Health Checks
- ✅ Database online and responsive
- ✅ Backup created: backup_20251215_1430.sql (523MB)
- ✅ Backup verified and restorable
- ✅ API endpoints healthy (12/12 responding)
- ✅ Disk space sufficient (78GB free)

#### Security Scan
- ✅ No critical vulnerabilities (npm audit)
- ✅ Dependencies up to date
- ✅ Secrets rotation not needed

#### Performance Baseline
- Current response time: 185ms (p95)
- Current throughput: 450 req/s
- Database connections: 12/100 used

**Next:** Proceed to deployment

@00-orchestrator Pre-deploy checks passed
```

**Stage 2 - Deployment (Blue-Green):**
```markdown
### 🚀 STAGE 2: Deployment IN PROGRESS

**Strategy:** Blue-Green Deployment  
**Downtime:** Zero (expected)

#### Deployment Steps
1. ✅ Deploy to Green environment
2. ✅ Run migrations (0.3s)
3. ✅ Health check Green (all passing)
4. ⏳ Switch traffic to Green (0% → 100%)
5. ⏳ Monitor for 5 minutes
6. ⏳ Decommission Blue

**Current Status:** Traffic switching (20% on Green)

**Monitoring:** Real-time metrics dashboard
```

**Stage 3 - Post-Deploy Validation:**
```markdown
### ✅ STAGE 3: Deployment SUCCESSFUL

**Agent:** @10-devops-cicd-agent  
**Deployed:** v1.3.0  
**Duration:** 8 minutes

#### Deployment Summary
- ✅ Blue-Green switch completed
- ✅ All smoke tests passed (15/15)
- ✅ Zero downtime achieved
- ✅ No errors in logs (5-min window)

#### Performance Validation
```bash
Before: 185ms (p95)
After:  142ms (p95) ✅ 23% improvement

Before: 450 req/s
After:  680 req/s ✅ 51% improvement
```

#### Health Check
- ✅ Database: Responsive (12ms latency)
- ✅ API: All endpoints healthy
- ✅ Frontend: Loading correctly
- ✅ No 5xx errors

**Next:** Monitor for 1 hour, then close deployment issue

@00-orchestrator Deployment complete and validated
```

**Stage 4 - Rollback Ready:**
```markdown
### 🔄 ROLLBACK CAPABILITY VERIFIED

**Blue Environment:** Preserved for 24h  
**Rollback Command:** `./scripts/rollback.sh v1.2.3`  
**Rollback Time:** <2 minutes

**Rollback Tested:** ✅ Dry-run successful
```

### Integration with Feature Pipeline

**CI/CD for every feature:**
- GitHub Actions runs on every PR
- Automated tests + build
- Deploy to staging (if `develop` branch)

### Auto-Rollback on Failure

**Triggers automatic rollback if:**
- Error rate >1% (5xx responses)
- Response time >1000ms (p95)
- Health check fails
- Database connection errors

```markdown
### ⚠️ AUTO-ROLLBACK TRIGGERED

**Reason:** Error rate exceeded threshold (2.3% > 1%)
**Action:** Rolling back to v1.2.3
**Status:** Rollback in progress...

**Rollback Complete:** ✅  
**Time:** 1m 45s  
**Service Restored:** v1.2.3 running

**Root Cause Analysis:** Required

@00-orchestrator Deployment rolled back, investigate errors
```

### Deployment Checklist

**Pre-Deploy:**
- [ ] Database backup created and verified
- [ ] Migrations tested on staging
- [ ] Security scan passed
- [ ] Performance baseline recorded

**During Deploy:**
- [ ] Blue-Green deployment
- [ ] Smoke tests pass
- [ ] Monitoring active

**Post-Deploy:**
- [ ] Health checks pass
- [ ] Performance validated
- [ ] No errors in logs
- [ ] Rollback tested

---

**Current Status:** Local development only  
**Next Step:** Setup CI/CD pipeline (GitHub Actions)  
**Version:** 2.0 (Orchestration-enabled + Deployment Pipeline)
