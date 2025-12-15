# 🚀 Getting Started with GoBeyondFit

**Time to Complete:** ~5 minutes  
**Prerequisites:** Docker, Node.js 20+, Git

---

## Quick Start

### 1. Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/Baptiste0103/GoBeyondFit.git
cd GoBeyondFit

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Start Development Environment (2 min)

```bash
# Start PostgreSQL + services
docker-compose up -d

# Run database migrations
cd backend
npx prisma migrate dev
npx prisma db seed

# Start backend (Terminal 1)
npm run start:dev

# Start frontend (Terminal 2)
cd ../frontend
npm run dev
```

### 3. Access Application (1 min)

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Prisma Studio:** http://localhost:5555
- **API Docs:** http://localhost:3001/api/docs

**Default Admin Credentials:**
- Email: `admin@gobeyondfit.com`
- Password: `Admin123!`

---

## ✅ Verify Installation

```bash
# Check backend health
curl http://localhost:3001/health

# Check database connection
cd backend && npx prisma studio

# Run tests
npm run test
```

**Expected:** All services running, tests passing ✅

---

## 📖 Next Steps

1. **Security First:** Read [SECURITY_FIRST.md](SECURITY_FIRST.md) (MANDATORY)
2. **Architecture:** Understand [01_ARCHITECTURE.md](01_ARCHITECTURE.md)
3. **Development:** Learn [02_DEVELOPMENT_WORKFLOW.md](02_DEVELOPMENT_WORKFLOW.md)
4. **Agent System:** Explore [06_AGENT_SYSTEM.md](06_AGENT_SYSTEM.md)

---

## 🔧 Troubleshooting

**Port conflicts:**
```bash
# Change ports in docker-compose.yml
DATABASE_URL="postgresql://user:pass@localhost:5433/gobeyondfit"
```

**Database issues:**
```bash
docker-compose down -v  # Reset database
docker-compose up -d
cd backend && npx prisma migrate dev
```

**Frontend not loading:**
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

---

**Ready to develop!** 🎉 See [INDEX.md](INDEX.md) for full documentation.
