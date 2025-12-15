# 💻 Development Workflow

**Essential guide for daily development**

---

## Git Workflow

### Branch Strategy

```bash
master                    # Production-ready code
  ├── feature/new-feature # Feature branches
  ├── fix/bug-description # Bug fixes
  └── refactor/cleanup    # Code improvements
```

### Standard Workflow

```bash
# 1. Create feature branch
git checkout -b feature/exercise-filters

# 2. Make changes
# ... code ...

# 3. Stage changes (pre-commit hooks run automatically)
git add .
git commit -m "feat: Add exercise filtering by muscle group"

# 4. Push to GitHub
git push origin feature/exercise-filters

# 5. Create Pull Request
# GitHub Actions run 4 validation gates

# 6. Merge after approval
git checkout master
git pull origin master
```

---

## Pre-Commit Security Hooks

**Automatic validation on every commit:**

### 8 Security Checks

1. **Hardcoded Secrets** - Blocks API keys, passwords, tokens
2. **console.log** - Warns about debug statements
3. **Commented Auth** - Blocks commented `@UseGuards`
4. **Missing userId** - Blocks Prisma queries without userId
5. **Raw SQL** - Warns about `$queryRaw` usage
6. **.env Files** - Blocks accidental .env commits
7. **JWT_SECRET** - Blocks hardcoded secrets
8. **Database URLs** - Blocks connection string leaks

**Example Output:**

```bash
🔒 Running security pre-commit checks...
🔍 Checking for hardcoded secrets...
🔍 Checking for console.log statements...
✅ Pre-commit PASSED: All security checks OK
```

**If blocked:**
```bash
❌ BLOCKED: Prisma query without userId filter
   All Prisma queries MUST include userId for multi-tenancy
   ✅ prisma.exercise.findMany({ where: { userId } })
   ❌ prisma.exercise.findMany({})
```

---

## Agent Orchestration System

### When to Use Agents

**Use Agent 00 (Orchestrator) for:**
- Complex multi-step features
- Cross-cutting concerns
- Architecture decisions

**Use Specialized Agents directly for:**
- Security questions → Agent 01
- Database changes → Agent 02
- API development → Agent 03
- Performance issues → Agent 04
- Testing → Agent 05
- Frontend → Agent 06
- Documentation → Agent 07

### Example: Adding New Feature

```
1. Ask Orchestrator:
   @agent-00-orchestrator "Add exercise filtering by muscle group"

2. Orchestrator delegates:
   ├─> Agent 01: Security check (userId filter?)
   ├─> Agent 02: Database changes needed?
   ├─> Agent 03: API endpoint implementation
   ├─> Agent 05: Write tests
   └─> Agent 06: Frontend UI

3. Agents collaborate:
   - Each agent provides specialized output
   - Orchestrator ensures consistency
   - All follow security requirements

4. Output:
   - Database migration
   - Backend service + controller
   - Frontend component
   - Tests (unit + E2E)
   - Documentation update
```

---

## 4 Validation Gates

### Gate #1: Static Analysis

**Runs on:** Every commit, every PR

```bash
# Local check
npm run lint
npm run build
npx prisma validate
```

**Checks:**
- ESLint (code style)
- TypeScript compilation
- Prisma schema validation

**Fails if:** Lint errors, type errors, invalid schema

---

### Gate #2: Unit & Integration Tests

**Runs on:** Every PR

```bash
# Local check
npm run test
npm run test:cov
```

**Requirements:**
- All tests passing ✅
- 80% minimum coverage
- No skipped tests

**Fails if:** Test failures, coverage <80%

---

### Gate #3: Security & Performance

**Runs on:** Every PR

```bash
# Local check
npm audit
npx ts-node scripts/performance-check.ts
```

**Checks:**
- Security vulnerabilities (npm audit)
- Performance benchmarks (<500ms queries)
- N+1 query detection
- Multi-tenancy validation

**Fails if:**
- High/critical vulnerabilities
- Slow queries (>500ms)
- N+1 queries detected
- Missing userId filters

---

### Gate #4: End-to-End Tests

**Runs on:** Every PR to master

```bash
# Local check
npm run test:e2e
```

**4 Test Suites:**
1. **Security E2E** - Multi-tenancy, auth, RBAC
2. **Performance E2E** - Query speed, load times
3. **Workflow E2E** - User journeys (create program, workout)
4. **Review Queue E2E** - Coach workflows

**Fails if:** Any E2E test fails

---

## Development Commands

### Backend

```bash
# Development server (hot reload)
cd backend
npm run start:dev

# Build for production
npm run build
npm run start:prod

# Database
npx prisma migrate dev           # Create migration
npx prisma migrate deploy         # Apply migrations
npx prisma studio                 # Database GUI
npx prisma db seed                # Seed data

# Testing
npm run test                      # Unit tests
npm run test:watch                # Watch mode
npm run test:cov                  # With coverage
npm run test:e2e                  # E2E tests

# Performance
npx ts-node scripts/performance-check.ts

# Linting
npm run lint
npm run lint:fix
```

### Frontend

```bash
# Development server
cd frontend
npm run dev

# Build for production
npm run build
npm run start

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset database
docker-compose down -v
docker-compose up -d
```

---

## Common Development Tasks

### Add New API Endpoint

```bash
# 1. Security check
Read SECURITY_FIRST.md checklist

# 2. Use Agent 03 (API Development)
@agent-03-api "Add GET /exercises/:id endpoint"

# 3. Implement
backend/src/exercises/
├── dto/find-one.dto.ts          # Request validation
├── exercises.controller.ts      # @Get(':id') endpoint
└── exercises.service.ts         # Business logic

# 4. Test
backend/src/exercises/
└── exercises.service.spec.ts    # Unit tests

backend/test/
└── exercises.e2e-spec.ts        # E2E tests

# 5. Commit (pre-commit hooks validate)
git add .
git commit -m "feat: Add exercise detail endpoint"
```

### Add Database Table

```bash
# 1. Update Prisma schema
backend/prisma/schema.prisma

model NewFeature {
  id     Int  @id @default(autoincrement())
  userId Int  // ⚠️ REQUIRED for multi-tenancy
  user   User @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

# 2. Create migration
npx prisma migrate dev --name add_new_feature

# 3. Update TypeScript types (auto-generated)
npx prisma generate

# 4. Use in services
async findAll(userId: number) {
  return this.prisma.newFeature.findMany({
    where: { userId }  // ⚠️ MANDATORY
  });
}
```

### Fix Security Issue

```bash
# 1. Identify issue (pre-commit or security agent)
❌ Missing userId filter detected

# 2. Ask Security Agent
@agent-01-security "Review multi-tenancy in exercises.service.ts"

# 3. Fix
- async findAll() {
+ async findAll(userId: number) {
    return this.prisma.exercise.findMany({
+     where: { userId }
    });
  }

# 4. Test
npm run test:e2e -- security-multi-tenancy

# 5. Commit (security hooks validate)
git commit -m "fix: Add userId filter to exercise queries"
```

---

## Troubleshooting

### Pre-Commit Blocked

**Issue:** `❌ BLOCKED: Hardcoded secret detected`

**Solution:**
```bash
# Move secret to .env
DATABASE_URL="postgresql://..."  # ❌ In code

# backend/.env
DATABASE_URL="postgresql://..."  # ✅ In .env file

# Access in code
process.env.DATABASE_URL
```

### Tests Failing

**Issue:** `Coverage <80%`

**Solution:**
```bash
# Check uncovered lines
npm run test:cov

# View coverage report
open coverage/lcov-report/index.html

# Add missing tests
```

### Performance Benchmark Failed

**Issue:** `Query >500ms detected`

**Solution:**
```bash
# Run performance check
npx ts-node scripts/performance-check.ts

# Check slow queries in report
cat performance-reports/latest.json

# Optimize (add indexes, reduce joins)
@@index([userId, status])
```

---

## Best Practices

✅ **Always:**
- Read SECURITY_FIRST.md before implementing
- Include userId in all Prisma queries
- Use DTOs for request validation
- Write tests (unit + E2E)
- Use agents for complex tasks
- Run pre-commit checks locally

❌ **Never:**
- Skip security checklist
- Commit .env files
- Comment out @UseGuards
- Use raw SQL without parameterization
- Skip tests
- Push directly to master

---

## Next Steps

- **Security:** [SECURITY_FIRST.md](SECURITY_FIRST.md) (MANDATORY)
- **Testing:** [09_TESTING_STRATEGY.md](09_TESTING_STRATEGY.md)
- **Agents:** [06_AGENT_SYSTEM.md](06_AGENT_SYSTEM.md)
- **Deployment:** [14_DEPLOYMENT.md](14_DEPLOYMENT.md)
