# 🎯 Post-Completion Hooks Protocol

**Version:** 1.0  
**Purpose:** Agent validation and handoff procedures after task completion

---

## Overview

After completing a task, agents MUST follow this protocol before notifying the Orchestrator.

---

## Stage 1: Self-Validation

### ✅ Code Quality Checklist

```markdown
- [ ] Code compiles without errors (TypeScript/ESLint)
- [ ] All imports resolved correctly
- [ ] No console.log statements (use logger)
- [ ] Proper error handling implemented
- [ ] DTOs validated with class-validator
- [ ] Type safety maintained (no `any` types)
```

### ✅ Security Checklist (MANDATORY)

**From SECURITY_FIRST.md:**

```markdown
- [ ] Multi-tenancy: userId filter in ALL Prisma queries
- [ ] Authentication: @UseGuards(JwtAuthGuard) on endpoints
- [ ] Authorization: @Roles decorator where needed
- [ ] Input validation: DTO classes with decorators
- [ ] SQL injection: No raw SQL or parameterized only
- [ ] Sensitive data: No credentials in code
- [ ] Error handling: No data leaks in error messages
- [ ] Data isolation: Verified userId enforcement
```

### ✅ Testing Checklist

```markdown
- [ ] Unit tests written for services
- [ ] Integration tests for complex logic
- [ ] E2E tests for user workflows
- [ ] Test coverage >80% for new code
- [ ] All tests passing locally
- [ ] No skipped or disabled tests
```

### ✅ Performance Checklist

```markdown
- [ ] Database queries <500ms (run performance-check.ts)
- [ ] No N+1 queries detected
- [ ] Appropriate indexes added to schema
- [ ] Pagination implemented for large datasets
- [ ] Query optimization reviewed
```

### ✅ Documentation Checklist

```markdown
- [ ] JSDoc comments for public methods
- [ ] README updated (if architecture changed)
- [ ] API documentation updated (if endpoints added)
- [ ] Agent definition updated (if new capabilities)
```

---

## Stage 2: Validation Commands

### Run Local Validation

```bash
# 1. Linting & Type Check
npm run lint
npm run build

# 2. Unit Tests
npm run test

# 3. Coverage Check
npm run test:cov
# Verify >80% coverage for changed files

# 4. E2E Tests (relevant suites)
npm run test:e2e

# 5. Security Audit
npm audit

# 6. Performance Benchmark
npx ts-node scripts/performance-check.ts

# 7. Prisma Validation
npx prisma validate
```

**All commands MUST pass ✅ before proceeding.**

---

## Stage 3: Pre-Commit Validation

### Stage Changes

```bash
git add .
```

### Pre-Commit Hooks Run Automatically

**8 Security Checks:**
1. Hardcoded secrets
2. console.log statements
3. Commented authentication
4. Missing userId filters
5. Raw SQL queries
6. .env file commits
7. JWT_SECRET hardcoded
8. Database URL leaks

**Expected Output:**

```bash
🔒 Running security pre-commit checks...
✅ Pre-commit PASSED: All security checks OK
```

**If Blocked:**

Fix issues shown in error message, then retry commit.

---

## Stage 4: Commit Message Format

### Conventional Commits

```bash
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Add/update tests
- `docs:` Documentation only
- `style:` Code style (formatting)
- `perf:` Performance improvement
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(exercises): Add muscle group filtering"

# Fix with multi-line
git commit -m "fix(auth): Add userId filter to session queries

- Updated session.service.ts
- Added multi-tenancy tests
- Fixes security audit finding #42"

# Performance
git commit -m "perf(workouts): Add index on userId and status"

# Documentation
git commit -m "docs: Update API reference for exercises endpoint"
```

---

## Stage 5: Push & PR Creation

### Push to GitHub

```bash
git push origin feature/your-branch
```

### Create Pull Request

**PR Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Performance improvement
- [ ] Documentation update
- [ ] Refactoring

## Security Checklist (MANDATORY)
- [ ] Multi-tenancy validated (userId filters)
- [ ] Authentication guards present
- [ ] Input validation via DTOs
- [ ] No hardcoded secrets
- [ ] Security tests passing

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Coverage >80%
- [ ] All tests passing locally

## Performance
- [ ] Performance benchmarks passing (<500ms)
- [ ] No N+1 queries
- [ ] Database indexes added if needed

## Documentation
- [ ] Code comments added
- [ ] API docs updated
- [ ] README updated (if needed)

## Validation Gates
- [ ] Gate #1: Static analysis (auto)
- [ ] Gate #2: Tests (auto)
- [ ] Gate #3: Security & Performance (auto)
- [ ] Gate #4: E2E tests (auto)

## Agent Validation
Agent: [Agent Name/Number]
Task ID: [Task ID from todo list]
Orchestrator Notified: [ ] Yes
```

### Request Reviews

1. **Automatic:** GitHub Actions run 4 validation gates
2. **Manual:** Request code review from team (if applicable)
3. **Agent Review:** Agent 09 (Code Review) analyzes PR

---

## Stage 6: Orchestrator Notification

### Notification Format

After PR created and validation gates passing:

```json
{
  "agent": "agent-03-api",
  "task_id": 27,
  "status": "completed",
  "summary": "Added exercise filtering endpoint",
  "deliverables": [
    "backend/src/exercises/dto/filter.dto.ts",
    "backend/src/exercises/exercises.controller.ts",
    "backend/src/exercises/exercises.service.ts",
    "backend/src/exercises/exercises.service.spec.ts",
    "backend/test/exercises.e2e-spec.ts"
  ],
  "validation": {
    "security_checks": "✅ PASSED",
    "unit_tests": "✅ PASSED (85% coverage)",
    "e2e_tests": "✅ PASSED",
    "performance": "✅ PASSED (avg 142ms)",
    "pre_commit": "✅ PASSED"
  },
  "pr_url": "https://github.com/Baptiste0103/GoBeyondFit/pull/123",
  "next_steps": [
    "Wait for validation gates to complete",
    "Address any review comments",
    "Merge after approval"
  ]
}
```

### Notify Orchestrator

```
@agent-00-orchestrator Task #27 complete. PR #123 created.

Summary: Added exercise filtering by muscle group
Status: All validation checks passed ✅
PR: https://github.com/.../pull/123

Deliverables:
- Filter DTO with validation
- Controller endpoint (GET /exercises?muscleGroup=...)
- Service business logic
- Unit tests (85% coverage)
- E2E tests (security + workflow)

Validation:
✅ Security: Multi-tenancy enforced, guards present
✅ Tests: 12 new tests, all passing
✅ Performance: avg 142ms, no N+1 detected
✅ Pre-commit: All 8 security checks passed

Next: Awaiting validation gates + code review
```

---

## Stage 7: Post-Merge Actions

### After PR Merged

1. **Update Task Status**
   ```
   @agent-00-orchestrator Mark task #27 as merged
   ```

2. **Deploy Notification** (if production)
   ```
   Feature deployed to production:
   - Exercise filtering by muscle group
   - Monitor: Performance metrics, error rates
   ```

3. **Documentation Update**
   - Update API documentation
   - Update user guides (if user-facing)

4. **Metrics Collection**
   - Test execution times
   - Code coverage trend
   - Performance benchmarks

---

## Error Recovery

### If Validation Fails

**Pre-Commit Blocked:**
```bash
❌ BLOCKED: Missing userId filter

Action:
1. Fix the issue (add userId filter)
2. Re-stage files: git add .
3. Retry commit: git commit -m "..."
```

**Gate #2 Failed (Tests):**
```bash
❌ Gate #2 FAILED: Coverage 75% (requirement: 80%)

Action:
1. Run: npm run test:cov
2. Identify uncovered code
3. Add missing tests
4. Push: git push origin feature-branch
```

**Gate #3 Failed (Performance):**
```bash
❌ Gate #3 FAILED: Query >500ms detected

Action:
1. Run: npx ts-node scripts/performance-check.ts
2. Check report: performance-reports/latest.json
3. Optimize queries (add indexes, reduce joins)
4. Verify: Re-run performance check
5. Push: git push origin feature-branch
```

**Gate #4 Failed (E2E):**
```bash
❌ Gate #4 FAILED: E2E test "should enforce multi-tenancy" failed

Action:
1. Run locally: npm run test:e2e
2. Debug failing test
3. Fix root cause
4. Verify: All E2E tests pass locally
5. Push: git push origin feature-branch
```

---

## Agent-Specific Protocols

### Security Agent (01)

**Additional Checks:**
- Security audit report generated
- Vulnerability scan completed
- OWASP Top 10 validation
- Multi-tenancy test suite passing

### Performance Agent (04)

**Additional Checks:**
- Performance report generated
- Benchmark comparison (before/after)
- N+1 detection report
- Query optimization recommendations

### Testing Agent (05)

**Additional Checks:**
- Test coverage trend (increasing?)
- Flaky test detection
- Test execution time analysis
- Test quality score

### Documentation Agent (07)

**Additional Checks:**
- All new public APIs documented
- Code examples provided
- README.md updated
- API docs regenerated

---

## Metrics & Monitoring

### Track Post-Completion Metrics

```json
{
  "task_id": 27,
  "agent": "agent-03-api",
  "completion_time": "2025-12-15T14:30:00Z",
  "validation_duration": "3m 42s",
  "metrics": {
    "files_changed": 5,
    "lines_added": 247,
    "lines_removed": 12,
    "test_coverage": "85%",
    "tests_added": 12,
    "performance_avg": "142ms",
    "security_score": "100%"
  },
  "gates_status": {
    "gate_1": "✅ PASSED",
    "gate_2": "✅ PASSED",
    "gate_3": "✅ PASSED",
    "gate_4": "✅ PASSED"
  }
}
```

---

## Integration with Orchestrator

### Orchestrator Responsibilities

After receiving completion notification:

1. **Verify Deliverables**
   - All files mentioned created/modified
   - PR created and passing gates
   - Tests and documentation complete

2. **Update Task Tracking**
   - Mark task as "completed"
   - Update project metrics
   - Log completion time

3. **Dependency Check**
   - Identify dependent tasks
   - Notify relevant agents
   - Update task priorities

4. **Quality Gate**
   - Overall project quality maintained
   - No regressions introduced
   - Integration successful

---

## Best Practices

✅ **Always:**
- Complete ALL checklists before notifying Orchestrator
- Run validation commands locally
- Create descriptive PR with checklist
- Include security validation results
- Monitor validation gates

❌ **Never:**
- Skip security checklist
- Commit without running tests
- Bypass pre-commit hooks (--no-verify)
- Create PR with failing tests
- Ignore performance warnings

---

## Quick Reference

**Minimum Requirements:**

```bash
# Must pass locally BEFORE commit:
npm run lint              ✅
npm run build             ✅
npm run test              ✅
npm run test:cov          ✅ (>80%)
npm audit                 ✅ (no high/critical)
npx ts-node scripts/performance-check.ts  ✅

# Must pass BEFORE PR merge:
Gate #1: Static analysis  ✅
Gate #2: Tests            ✅
Gate #3: Security + Perf  ✅
Gate #4: E2E tests        ✅
```

---

**Next:** See [02_DEVELOPMENT_WORKFLOW.md](../Documentation/02_DEVELOPMENT_WORKFLOW.md) for full development workflow.
