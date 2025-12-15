# E2E Testing Guide

Complete guide for running, writing, and debugging end-to-end tests in GoBeyondFit.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Suites Overview](#test-suites-overview)
3. [Running Tests Locally](#running-tests-locally)
4. [Writing E2E Tests](#writing-e2e-tests)
5. [CI/CD Integration](#cicd-integration)
6. [Debugging Tests](#debugging-tests)
7. [Metrics & Monitoring](#metrics--monitoring)
8. [Best Practices](#best-practices)

---

## Quick Start

### Prerequisites

```bash
# 1. PostgreSQL test database running
docker-compose up -d postgres

# 2. Install dependencies
cd backend
npm install

# 3. Setup test environment
cat > .env.test << EOF
DATABASE_URL="postgresql://testuser:testpassword@localhost:5432/gobeyondfit_test?schema=public"
JWT_SECRET="test-jwt-secret-do-not-use-in-production-12345"
NODE_ENV="test"
PORT=3001
EOF

# 4. Run Prisma migrations
npx prisma migrate deploy
```

### Run All E2E Tests

```bash
# Run all 4 test suites
npm run test:e2e

# Run specific suite
npm run test:e2e -- e2e-security.e2e-spec.ts
npm run test:e2e -- e2e-performance.e2e-spec.ts
npm run test:e2e -- e2e-workflow.e2e-spec.ts
npm run test:e2e -- e2e-review-queue.e2e-spec.ts
```

---

## Test Suites Overview

### 1. Security E2E Tests (`e2e-security.e2e-spec.ts`)

**🔒 CRITICAL - Must Pass Before Deployment**

Tests multi-tenant data isolation and authentication security.

**What it tests:**
- ✅ Multi-tenant data isolation (users can only see their own data)
- ✅ Authentication (JWT validation, token expiry)
- ✅ Role-based access control (CLIENT, COACH, ADMIN)
- ✅ SQL injection protection
- ✅ Mass assignment protection

**Key test scenarios:**
```typescript
// User 1 cannot access User 2's data
it('🔒 CRITICAL: User 1 cannot access User 2 exercise by ID', async () => {
  await request(app.getHttpServer())
    .get(`/api/exercises/${user2ExerciseId}`)
    .set('Authorization', `Bearer ${user1Token}`)
    .expect(403); // Should be Forbidden, not 404
});

// Role-based access control
it('🔒 CRITICAL: CLIENT cannot access coach-only review queue', async () => {
  await request(app.getHttpServer())
    .get('/api/workouts/review-queue')
    .set('Authorization', `Bearer ${clientToken}`)
    .expect(403);
});
```

**Failure impact:** 🚨 **DEPLOYMENT BLOCKED** - Security vulnerabilities detected

---

### 2. Performance E2E Tests (`e2e-performance.e2e-spec.ts`)

**⚡ CRITICAL - Must Pass Before Deployment**

Tests query performance and optimization.

**What it tests:**
- ✅ All queries < 500ms (FAIL threshold)
- ✅ All queries < 200ms (WARN threshold)
- ✅ No N+1 query problems
- ✅ Database indexing validation
- ✅ Query optimization

**Key test scenarios:**
```typescript
// Query performance
it('should fetch exercises list in < 500ms', async () => {
  const start = Date.now();
  await request(app.getHttpServer())
    .get('/api/exercises')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(500);
});

// N+1 detection
it('should not have N+1 queries when fetching program with workouts', async () => {
  queryLogs.length = 0;
  await request(app.getHttpServer())
    .get('/api/programs')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  const workoutQueries = queryLogs.filter(log => 
    log.query.includes('Workout') && log.query.includes('SELECT')
  );
  
  expect(workoutQueries.length).toBeLessThanOrEqual(2);
});
```

**Failure impact:** ⚠️ Performance benchmarks not met - may cause slow user experience

---

### 3. Workflow E2E Tests (`e2e-workflow.e2e-spec.ts`)

Tests complete user journeys from start to finish.

**What it tests:**
- ✅ Program creation workflow (6 steps)
- ✅ Workout session workflow (6 steps)
- ✅ Exercise library workflow (6 steps)
- ✅ Error recovery scenarios

**Key test scenarios:**
```typescript
// Complete program creation flow
describe('Program Creation Workflow', () => {
  it('Step 1: User creates exercises for program', async () => { /* ... */ });
  it('Step 2: User creates a training program', async () => { /* ... */ });
  it('Step 3: User adds workouts to program', async () => { /* ... */ });
  it('Step 4: User adds exercises to workouts', async () => { /* ... */ });
  it('Step 5: User views completed program', async () => { /* ... */ });
  it('Step 6: User edits program details', async () => { /* ... */ });
});
```

**Failure impact:** ⚠️ User workflows broken - core features not working

---

### 4. Review Queue E2E Tests (`e2e-review-queue.e2e-spec.ts`)

Tests coach-specific workflows and review features.

**What it tests:**
- ✅ Review queue access control
- ✅ Session submission and review
- ✅ Review queue filtering
- ✅ Calendar integration
- ✅ Student progress tracking
- ✅ Batch operations

**Key test scenarios:**
```typescript
// Coach access control
it('should allow coach to access review queue', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/workouts/review-queue')
    .set('Authorization', `Bearer ${coachToken}`)
    .expect(200);
  
  expect(Array.isArray(response.body)).toBe(true);
});

// Session review
it('should allow coach to approve session', async () => {
  const reviewData = {
    approved: true,
    feedback: 'Great workout!',
    rating: 5,
  };

  const response = await request(app.getHttpServer())
    .post(`/api/workouts/review-queue/${sessionId}/review`)
    .set('Authorization', `Bearer ${coachToken}`)
    .send(reviewData)
    .expect(200);
});
```

**Failure impact:** ⚠️ Coach workflows broken - review features not working

---

## Running Tests Locally

### Run Individual Test Suite

```bash
cd backend

# Security tests
npm run test:e2e -- e2e-security.e2e-spec.ts --verbose

# Performance tests
npm run test:e2e -- e2e-performance.e2e-spec.ts --verbose

# Workflow tests
npm run test:e2e -- e2e-workflow.e2e-spec.ts --verbose

# Review queue tests
npm run test:e2e -- e2e-review-queue.e2e-spec.ts --verbose
```

### Run Specific Test

```bash
# Run one test by name
npm run test:e2e -- e2e-security.e2e-spec.ts -t "User 1 cannot access User 2 exercise"

# Run all tests in a describe block
npm run test:e2e -- e2e-security.e2e-spec.ts -t "Multi-Tenant Data Isolation"
```

### Watch Mode (for development)

```bash
# Re-run tests on file changes
npm run test:e2e -- --watch e2e-workflow.e2e-spec.ts
```

### Coverage Report

```bash
# Generate coverage report
npm run test:e2e -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

---

## Writing E2E Tests

### Test Structure Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('My E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // 1. Create test module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // 2. Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        password: '$2b$10$hashedPassword',
        role: 'CLIENT',
      },
    });
    userId = testUser.id;

    // 3. Authenticate
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'TestPassword123!' });
    
    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('Feature Tests', () => {
    it('should test feature', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('expectedField');
    });
  });
});
```

### Best Practices for Writing Tests

#### 1. **Test Isolation**

```typescript
// ✅ GOOD: Each test creates its own data
it('should create exercise', async () => {
  const exercise = await prisma.exercise.create({
    data: { name: 'Test Exercise', userId },
  });
  
  const response = await request(app.getHttpServer())
    .get(`/api/exercises/${exercise.id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  // Cleanup
  await prisma.exercise.delete({ where: { id: exercise.id } });
});

// ❌ BAD: Tests depend on shared state
let sharedExerciseId;

it('should create exercise', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/exercises')
    .send({ name: 'Shared Exercise' })
    .expect(201);
  
  sharedExerciseId = response.body.id; // Other tests depend on this
});
```

#### 2. **Descriptive Test Names**

```typescript
// ✅ GOOD: Clear what is being tested
it('should return 403 when client tries to access coach-only review queue', async () => {
  // ...
});

// ❌ BAD: Vague test name
it('should work correctly', async () => {
  // ...
});
```

#### 3. **Test Critical Security Paths**

```typescript
// Always test permission boundaries
it('🔒 CRITICAL: User cannot delete another user\'s program', async () => {
  // Create program for user2
  const program = await prisma.program.create({
    data: { name: 'User2 Program', userId: user2Id },
  });

  // Try to delete with user1's token
  await request(app.getHttpServer())
    .delete(`/api/programs/${program.id}`)
    .set('Authorization', `Bearer ${user1Token}`)
    .expect(403); // MUST be forbidden
  
  // Verify not deleted
  const stillExists = await prisma.program.findUnique({
    where: { id: program.id },
  });
  expect(stillExists).not.toBeNull();
});
```

#### 4. **Test Error Scenarios**

```typescript
// Test validation errors
it('should return 400 for invalid exercise data', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/exercises')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: '', // Invalid: empty name
      muscleGroup: 'INVALID_GROUP', // Invalid: bad enum
    })
    .expect(400);
  
  expect(response.body).toHaveProperty('message');
});

// Test not found scenarios
it('should return 404 for non-existent exercise', async () => {
  await request(app.getHttpServer())
    .get('/api/exercises/99999')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(404);
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

The E2E tests run automatically on every pull request via `.github/workflows/e2e-testing.yml`.

**Triggers:**
- Pull requests to `master`, `main`, or `develop`
- Push to `master` or `main`
- Manual trigger via GitHub Actions UI

**What happens:**
1. ✅ PostgreSQL test database starts
2. ✅ Dependencies installed
3. ✅ Prisma migrations applied
4. ✅ All 4 E2E test suites run
5. ✅ Test report generated
6. ✅ PR comment added with results
7. ✅ Artifacts uploaded (reports, coverage)

**View results:**
- GitHub Actions tab in repository
- PR comments (automatic)
- Download artifacts for detailed reports

### Gate #4: Final Deployment Validation

Before any production deployment, Gate #4 must pass.

**Run Gate #4 locally:**

```powershell
# Windows
.\.github\scripts\gate-4-validation.ps1

# Expected output:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 GATE #4: FINAL DEPLOYMENT VALIDATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 
# 🔒 STEP 1/4: Running Security E2E Tests (CRITICAL)
# ✅ Security Tests PASSED
# 
# ⚡ STEP 2/4: Running Performance E2E Tests (CRITICAL)
# ✅ Performance Tests PASSED
# 
# 🔄 STEP 3/4: Running Workflow E2E Tests
# ✅ Workflow Tests PASSED
# 
# 📋 STEP 4/4: Running Review Queue E2E Tests
# ✅ Review Queue Tests PASSED
# 
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✅ GATE #4 PASSED
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If Gate #4 fails:**

```
❌ GATE #4 FAILED
🚨 DEPLOYMENT BLOCKED
🚨 Fix failures before deploying to production

Failed Tests: 2
```

→ **DO NOT DEPLOY** until all tests pass.

---

## Debugging Tests

### Common Issues & Solutions

#### Issue 1: Test Database Connection Failed

**Error:**
```
Error: Connection timeout
Can't reach database server at localhost:5432
```

**Solution:**
```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Verify it's running
docker ps | grep postgres

# 3. Check connection
psql -h localhost -p 5432 -U testuser -d gobeyondfit_test
```

#### Issue 2: Authentication Failures

**Error:**
```
401 Unauthorized
```

**Solution:**
```typescript
// Check JWT_SECRET is set in .env.test
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Check token is valid
console.log('Auth Token:', authToken);

// Verify user exists
const user = await prisma.user.findUnique({
  where: { email: 'test@test.com' },
});
console.log('User:', user);
```

#### Issue 3: Prisma Query Timeouts

**Error:**
```
Error: Query timeout after 10000ms
```

**Solution:**
```bash
# 1. Check database load
psql -h localhost -p 5432 -U testuser -d gobeyondfit_test -c "SELECT * FROM pg_stat_activity;"

# 2. Reset test database
npx prisma migrate reset --force

# 3. Re-run migrations
npx prisma migrate deploy
```

#### Issue 4: Port Already in Use

**Error:**
```
Error: Port 3001 is already in use
```

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change port in .env.test
PORT=3002
```

### Debug Mode

```bash
# Run with verbose logging
npm run test:e2e -- --verbose --no-coverage

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand e2e-security.e2e-spec.ts

# Use VS Code debugger
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Jest E2E",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "e2e-security.e2e-spec.ts"],
  "cwd": "${workspaceFolder}/backend"
}
```

### Logging Best Practices

```typescript
// Add temporary debug logs
it('should test feature', async () => {
  console.log('📝 Starting test...');
  
  const response = await request(app.getHttpServer())
    .get('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  console.log('📊 Response:', JSON.stringify(response.body, null, 2));
  console.log('✅ Test complete');
});
```

---

## Metrics & Monitoring

### Test Metrics Collector

The `metrics-collector.ts` tracks test performance over time.

**What it tracks:**
- ✅ Execution time per test
- ✅ Flaky test detection (intermittent failures)
- ✅ Performance regressions
- ✅ Coverage trends

**View metrics:**

```bash
# Generate metrics report
npm run test:e2e -- --reporters=default --reporters=./test/metrics-collector.ts

# View dashboard
cat backend/test-metrics/dashboard.json
```

**Metrics Dashboard Structure:**
```json
{
  "currentRun": {
    "summary": {
      "totalTests": 45,
      "passed": 43,
      "failed": 2,
      "totalDuration": 12500,
      "passingRate": 95.6
    },
    "flakyTests": [
      {
        "testName": "should handle concurrent requests",
        "failureRate": 0.25,
        "totalRuns": 20
      }
    ],
    "performanceRegressions": [
      {
        "suiteName": "e2e-performance",
        "regressionPct": 35.2,
        "previousDuration": 2000,
        "currentDuration": 2704
      }
    ]
  }
}
```

### Flaky Test Detection

Tests that fail intermittently (20%-80% failure rate) are flagged.

**Example output:**
```
⚠️  FLAKY TESTS DETECTED: 2
  • should handle concurrent requests - 25.0% failure rate
  • should cache frequently accessed data - 30.0% failure rate
```

**How to fix flaky tests:**
1. Add proper waits/delays
2. Mock external dependencies
3. Increase timeouts for slow operations
4. Ensure proper test isolation

---

## Best Practices

### 1. **Keep Tests Fast**

```typescript
// ✅ GOOD: Parallel test execution
describe.concurrent('Fast Tests', () => {
  it('test 1', async () => { /* ... */ });
  it('test 2', async () => { /* ... */ });
});

// ❌ BAD: Sequential unnecessary waits
it('slow test', async () => {
  await new Promise(resolve => setTimeout(resolve, 5000)); // Unnecessary delay
});
```

### 2. **Clean Up Test Data**

```typescript
// ✅ GOOD: Cleanup in afterEach
afterEach(async () => {
  await prisma.exercise.deleteMany({ where: { userId } });
  await prisma.program.deleteMany({ where: { userId } });
});

// ❌ BAD: No cleanup, pollutes database
it('create exercise', async () => {
  await prisma.exercise.create({ /* ... */ });
  // No cleanup - data remains in DB
});
```

### 3. **Use Meaningful Assertions**

```typescript
// ✅ GOOD: Specific assertions
expect(response.body).toHaveProperty('id');
expect(response.body.name).toBe('Test Exercise');
expect(response.body.userId).toBe(userId);

// ❌ BAD: Vague assertions
expect(response.body).toBeTruthy();
```

### 4. **Test Edge Cases**

```typescript
// Test boundary conditions
it('should handle empty exercise list', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/exercises')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(response.body).toEqual([]);
});

// Test maximum values
it('should handle large pagination', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/exercises?limit=1000')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(response.body.length).toBeLessThanOrEqual(100); // Max limit
});
```

### 5. **Document Test Intent**

```typescript
/**
 * This test verifies that the multi-tenant data isolation is working.
 * User 1 should NEVER be able to see User 2's exercises, even if they
 * know the exercise ID. This is a CRITICAL security requirement.
 * 
 * If this test fails, we have a MAJOR security vulnerability.
 */
it('🔒 CRITICAL: User 1 cannot access User 2 exercise', async () => {
  // ...
});
```

---

## Summary

### Test Suite Checklist

Before deploying to production, ensure:

- ✅ All security tests pass (multi-tenancy, auth, RBAC)
- ✅ All performance tests pass (< 500ms queries, no N+1)
- ✅ All workflow tests pass (user journeys complete)
- ✅ All review queue tests pass (coach workflows functional)
- ✅ Gate #4 validation passes
- ✅ No flaky tests detected
- ✅ No performance regressions
- ✅ Coverage > 80%

### Quick Reference Commands

```bash
# Run all tests
npm run test:e2e

# Run specific suite
npm run test:e2e -- e2e-security.e2e-spec.ts

# Run with coverage
npm run test:e2e -- --coverage

# Run Gate #4
.\.github\scripts\gate-4-validation.ps1

# Generate metrics
npm run test:e2e -- --reporters=./test/metrics-collector.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand e2e-security.e2e-spec.ts
```

### Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/Baptiste0103/GoBeyondFit/issues)
2. Review [Architecture Documentation](./01_ARCHITECTURE.md)
3. Check test logs in `backend/test-metrics/`

---

**Last Updated:** December 15, 2025  
**Version:** 1.0.0  
**Maintainer:** GoBeyondFit Development Team
