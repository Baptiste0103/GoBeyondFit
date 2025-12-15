# Collaboration d'Équipe & CI/CD avec Copilot

## Table des Matières
1. [Collaboration d'Équipe](#collaboration-dequipe)
2. [Code Review Automation](#code-review-automation)
3. [CI/CD Integration](#cicd-integration)
4. [Documentation Collaborative](#documentation-collaborative)
5. [Onboarding](#onboarding)

---

## Collaboration d'Équipe

### Shared Prompt Library

**Créer une Bibliothèque de Prompts d'Équipe:**

```
"Create a shared prompt library for our team:

**Location:** `docs/copilot-prompts/`

**Categories:**
1. **Code Review** (review-prompts.md)
2. **Feature Implementation** (feature-prompts.md)
3. **Bug Fixing** (debug-prompts.md)
4. **Testing** (test-prompts.md)
5. **Documentation** (docs-prompts.md)

**Format for each prompt:**
```markdown
## [Prompt Name]

**When to use:** [Scenario]

**Template:**
```
[Prompt template with [PLACEHOLDERS]]
```

**Example:**
```
[Filled example]
```

**Tips:**
- [Specific tips]
```

**Generate:**
- Initial library with 5 prompts per category
- Based on our project (NestJS, Prisma, React)
- Team coding standards included
- Easy to copy-paste and customize"
```

---

### Team Coding Standards

```
"Create Copilot-friendly coding standards document:

**Purpose:**
Help Copilot generate code matching our team standards

**Content:**

1. **Project Context:**
```
We are building [project description]
Stack: [technologies]
Architecture: [description]
```

2. **Naming Conventions:**
```
Files: kebab-case (user-service.ts)
Classes: PascalCase (UserService)
Functions: camelCase (getUserById)
Constants: UPPER_SNAKE_CASE (MAX_RETRIES)
Interfaces: PascalCase with I prefix (IUserRepository) [or no prefix]
```

3. **Code Organization:**
```
Module structure:
module-name/
  dto/
  entities/
  module.ts
  controller.ts
  service.ts
  repository.ts [if applicable]
  tests/
```

4. **Patterns to Use:**
```
- Dependency Injection (NestJS)
- Repository pattern for data access
- DTO validation with Zod
- Custom exceptions (not generic Error)
- Logging with Winston
```

5. **Patterns to Avoid:**
```
- Direct Prisma usage in controllers
- any type (use unknown and narrow)
- console.log (use logger)
- Swallowed exceptions
```

6. **Example Prompts:**
```
"Following our team standards in docs/coding-standards.md,
create a new [module] with..."
```

**Generate complete coding standards document**
**Then create a prompt template to reference it**"
```

---

### Pair Programming Sessions

**Remote Pair Programming with Copilot:**

```
"Set up asynchronous pair programming workflow:

**Scenario:**
Developer A starts feature, Developer B continues

**Workflow:**

**Developer A (Day 1):**
1. Start feature implementation
2. At end of session, generate handoff document:

"Generate handoff document for [feature]:
- What I accomplished
- Current state of code (files modified)
- Next steps (prioritized)
- Key decisions made
- Questions/blockers
- How to continue (specific prompts)

Format for easy handoff to another developer"

**Developer B (Day 2):**
3. Read handoff document
4. Resume with context:

"I'm continuing [feature] from handoff doc: [paste doc]
Understand the context and current state.
What should be the next step?"

**Benefits:**
- Clear handoff
- No context loss
- Consistent coding
- Async collaboration

**Provide:**
- Handoff document template
- Context restoration prompt
- Example workflow"
```

---

## Code Review Automation

### Pre-Commit Review

```
"Create pre-commit review checklist automation:

**Goal:**
Catch issues before pushing to GitHub

**Checklist:**

1. **Code Quality:**
   - No console.log statements
   - No debugger statements
   - No TODO without ticket reference
   - Functions <50 lines
   - No duplicate code

2. **Security:**
   - No hardcoded secrets
   - No API keys in code
   - Sensitive data not logged
   - Input validation present

3. **Tests:**
   - New code has tests
   - Tests pass locally
   - Coverage not decreased

4. **Documentation:**
   - Public APIs documented
   - Complex logic commented
   - README updated if needed

5. **TypeScript:**
   - No any types
   - No @ts-ignore without comment
   - Strict mode compatible

**Implementation:**

Generate a prompt that I can run before committing:

```
Pre-commit review of my changes:
[Run all checks above]
Report: PASS/FAIL for each item
Show specific issues found with file:line
Provide quick fixes where possible
```

**Also generate:**
- Husky pre-commit hook calling this
- GitHub Action for backup check
- Team notification if checks bypassed"
```

---

### PR Review Assistant

```
"Create PR review assistant workflow:

**Scenario:**
Team member creates PR, needs review before assigning human reviewer

**Workflow:**

**Step 1 - Self Review:**
Developer runs before creating PR:
```
"Review my changes for PR:

Files changed:
[List files]

Check:
1. Code quality (complexity, duplication, naming)
2. Security (OWASP top 10)
3. Performance (N+1 queries, missing indexes)
4. Tests (coverage, edge cases)
5. Documentation (README, API docs, comments)
6. Breaking changes
7. Database migrations (reversible?)

For each issue:
- Severity (blocker/major/minor)
- File and line
- Description
- Suggested fix

Generate PR description including:
- What changed
- Why it changed
- How to test
- Checklist completed
- Known limitations"
```

**Step 2 - PR Template:**
```
## Description
[What and why]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
[How to test]

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] Self-reviewed with Copilot
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considered

## AI Review Summary
[Paste Copilot's review summary]
```

**Provide complete PR workflow automation"
```

---

### Automated Code Review Comments

```
"Generate automated review comments for PR:

**Input:**
PR diff: [paste]

**Output:**
Inline comments in GitHub format:

```
file: src/auth/auth.service.ts
line: 45
comment: |
  **Security Issue - High Priority**
  
  Password is logged here which is a security risk.
  
  **Suggestion:**
  ```typescript
  this.logger.log('User login attempt', { userId: user.id });
  // Remove: { ...user }
  ```
  
  **References:**
  - OWASP Sensitive Data Exposure
  - Team security policy: docs/security.md#logging
```

**Generate for:**
1. Security issues
2. Performance problems
3. Code quality issues
4. Missing tests
5. Documentation gaps
6. Style violations

**Format:**
- Constructive tone
- Specific suggestions
- Code examples
- Reference to standards
- Severity level

Provide review comment generator"
```

---

## CI/CD Integration

### GitHub Actions Workflows

```
"Generate comprehensive GitHub Actions workflows:

**1. PR Validation Workflow**
`.github/workflows/pr-validation.yml`

**Triggers:** Pull request to main/develop

**Jobs:**
- Lint (ESLint, Prettier)
- Type check (TypeScript)
- Unit tests
- Integration tests
- Build verification
- Security scan (npm audit)
- Coverage report
- Performance benchmarks

**Requirements:**
- Fast (<5 min)
- Parallel where possible
- Cache node_modules
- Comment results on PR
- Block merge if fails

**2. Main Branch Workflow**
`.github/workflows/main.yml`

**Triggers:** Push to main

**Jobs:**
- All PR validations
- E2E tests
- Build Docker images
- Push to registry
- Deploy to staging
- Run smoke tests
- Notify team

**3. Release Workflow**
`.github/workflows/release.yml`

**Triggers:** Tag push (v*)

**Jobs:**
- Run full test suite
- Build production images
- Deploy to production
- Run health checks
- Notify stakeholders
- Create GitHub release
- Update documentation

**4. Scheduled Workflows**
`.github/workflows/scheduled.yml`

**Triggers:** Cron (daily, weekly)

**Jobs:**
- Security audits
- Dependency updates
- Database backups verification
- Performance regression tests
- Dead code detection

**Provide:**
- Complete workflow files
- Secrets management guide
- Notification setup
- Rollback procedures"
```

---

### Docker Optimization

```
"Optimize Docker setup for development and production:

**Requirements:**
1. Fast builds (layer caching)
2. Small images (production)
3. Dev/prod parity
4. Multi-stage builds
5. Security scanning

**Dockerfile (Backend):**
```dockerfile
# Generate optimized multi-stage Dockerfile for NestJS:
- Stage 1: Dependencies (cached layer)
- Stage 2: Build
- Stage 3: Production (minimal)

Optimizations:
- Use .dockerignore
- Leverage build cache
- Minimize layers
- Use Alpine Linux
- Non-root user
- Health checks
```

**Dockerfile (Frontend):**
```dockerfile
# Generate for React:
- Build stage
- Nginx serve stage
- Optimized for production
```

**Docker Compose:**
```yaml
# Development environment:
services:
  - backend (with hot reload)
  - frontend (with hot reload)
  - postgresql
  - redis
  - maildev (email testing)

# Production-like:
  - All services
  - Nginx reverse proxy
  - SSL certificates
  - Health checks
  - Resource limits
```

**Provide:**
- Optimized Dockerfiles
- .dockerignore
- docker-compose.yml (dev and prod)
- Build scripts
- Documentation"
```

---

### Database Migrations in CI/CD

```
"Implement safe database migration in CI/CD:

**Requirements:**
1. Migrations run automatically on deploy
2. Rollback if migration fails
3. Zero-downtime for most migrations
4. Backup before migration
5. Validation after migration

**Strategy:**

**1. Pre-Deploy Checks:**
```typescript
// Check migration safety:
- Breaking changes detection
- Data loss warnings
- Estimated duration
- Rollback script generated
```

**2. Migration Execution:**
```typescript
// In CI/CD pipeline:
1. Backup database
2. Run migrations
3. Validate data integrity
4. Run smoke tests
5. If failure: auto-rollback
```

**3. Zero-Downtime Patterns:**
```typescript
// For breaking changes:
Phase 1: Add new column (nullable)
  - Deploy code using both old and new
  - Backfill data
  
Phase 2: Make non-nullable
  - Deploy code using only new
  
Phase 3: Remove old column
  - Clean up old code
```

**4. Monitoring:**
```typescript
// Track migration status:
- Duration
- Rows affected
- Errors encountered
- Rollback triggers
```

**Provide:**
- Migration CI/CD script
- Safety checks
- Rollback automation
- Zero-downtime patterns
- Monitoring setup"
```

---

### Automated Testing in CI

```
"Set up comprehensive automated testing in CI:

**Test Pyramid:**

1. **Unit Tests (70%)**
   - Fast (<30s total)
   - Run on every commit
   - Mock all dependencies
   - Parallel execution

2. **Integration Tests (20%)**
   - Test API endpoints
   - Use test database
   - Seed test data
   - Run on PR

3. **E2E Tests (10%)**
   - Critical user journeys
   - Real browser (Playwright)
   - Run before merge to main
   - Retry flaky tests

**CI Configuration:**

```yaml
# Generate GitHub Actions workflow:

Unit Tests:
  - Trigger: Every push
  - Matrix: Node 18, 20
  - Cache: node_modules
  - Parallel: by test suite
  - Fail fast: false
  - Coverage: upload to Codecov

Integration Tests:
  - Trigger: Pull request
  - Services: postgres, redis
  - Migrations: run first
  - Seed: test data
  - Cleanup: after tests

E2E Tests:
  - Trigger: PR to main
  - Browsers: chromium, firefox
  - Sharding: 4 workers
  - Video: on failure
  - Screenshots: on failure
  - Retry: 2 times
  
Performance Tests:
  - Trigger: Weekly
  - Load test: k6
  - Benchmark: against baseline
  - Alert: if >10% regression
```

**Test Data Management:**
```typescript
// Factories for test data
// Cleanup between tests
// Isolation guarantees
```

**Provide complete CI testing setup"
```

---

## Documentation Collaborative

### Auto-Generated Documentation

```
"Set up automated documentation generation:

**1. API Documentation:**
Generate from code:
- OpenAPI spec from NestJS decorators
- Swagger UI hosted
- Update on every deploy
- Version tracking

**2. Code Documentation:**
- JSDoc to markdown
- Type definitions extracted
- Example usage
- Auto-generated from comments

**3. Architecture Docs:**
- Dependency graphs (automatic)
- Database schema diagram (from Prisma)
- API flow diagrams
- Module relationships

**4. Changelog:**
- Generated from commits (conventional commits)
- Grouped by type (feat, fix, break)
- Link to PRs and issues

**Implementation:**

```yaml
# GitHub Action for docs:
on: [push to main]
jobs:
  generate-docs:
    - Extract OpenAPI spec
    - Generate type docs
    - Create diagrams
    - Build changelog
    - Deploy to GitHub Pages
    - Notify team
```

**Provide:**
- Documentation generation scripts
- GitHub Actions workflow
- Template structure
- Hosting setup"
```

---

### Living Documentation

```
"Create living documentation that stays up-to-date:

**Concept:**
Documentation embedded in code, extracted automatically

**Implementation:**

1. **Inline Docs:**
```typescript
/**
 * Creates a new workout program
 * 
 * @example
 * ```typescript
 * await programService.create({
 *   name: 'Beginner Program',
 *   difficulty: 'BEGINNER'
 * });
 * ```
 * 
 * @throws {ValidationError} If program data invalid
 * @throws {AuthorizationError} If user cannot create programs
 * 
 * @see {@link Program} for entity structure
 * @since v2.0.0
 */
async create(data: CreateProgramDto): Promise<Program> {
  // ...
}
```

2. **Auto-Extract:**
```typescript
// Script to extract:
- All @example tags → examples.md
- All @throws tags → error-handling.md
- All @see tags → cross-reference links
```

3. **Test as Documentation:**
```typescript
// Tests that read like specs:
describe('ProgramService.create', () => {
  it('creates program with valid data', async () => {
    // This test documents the happy path
  });
  
  it('throws ValidationError if name missing', async () => {
    // This documents validation rules
  });
});

// Extract to documentation
```

4. **CI Integration:**
```typescript
// On PR:
- Extract docs from code
- Compare with previous
- Flag if docs decreased
- Require docs for new public APIs
```

**Provide living docs setup"
```

---

## Onboarding

### New Developer Onboarding with Copilot

```
"Create comprehensive onboarding guide using Copilot:

**Day 1: Setup & Exploration**

**Morning:**
```
"I'm a new developer joining the team.
Help me understand the project:

1. What does this application do?
   @workspace explain the project purpose and main features

2. What's the tech stack?
   @workspace list all technologies and why each was chosen

3. How is the code organized?
   @workspace explain the folder structure and module architecture

4. Where do I start reading code?
   @workspace suggest the best files to read first for understanding
```

**Afternoon:**
```
"Help me set up development environment:

1. What do I need installed?
2. How do I set up the database?
3. How do I run the application locally?
4. How do I run tests?
5. How do I verify everything works?

Provide step-by-step commands"
```

**Day 2: First Contribution**

```
"I want to make my first contribution:

1. Show me a 'good first issue'
   @workspace find simple, well-contained features or bugs
   
2. Guide me through fixing it:
   - Where is the code?
   - What needs to change?
   - What tests to add?
   - How to verify?
```

**Week 1: Learning Patterns**

```
"Help me learn the codebase patterns:

1. How do we implement new features?
   Show me example of complete feature (backend + frontend)
   
2. How do we write tests?
   Show me example tests with explanations
   
3. How do we handle errors?
   Show me error handling patterns
   
4. How do we document code?
   Show me documentation examples

For each, use #file: to show actual code examples"
```

**Provide:**
- Complete onboarding guide
- Checklist for first week
- Copilot prompts for learning
- Mentorship pairing prompts"
```

---

### Knowledge Transfer Sessions

```
"Create knowledge transfer template for departing developer:

**Scenario:**
Developer leaving, needs to transfer knowledge

**Template:**

**Part 1: Domain Knowledge**
```
"I'm [Developer Name], working on [areas].
Generate knowledge transfer document:

1. My Areas of Responsibility:
   - Modules I own: [list]
   - Features I built: [list]
   - Ongoing projects: [list]

2. Critical Knowledge:
   - Important decisions and why
   - Gotchas and workarounds
   - Technical debt locations
   - Performance optimizations

3. Tribal Knowledge:
   - Undocumented patterns
   - Why things are the way they are
   - External dependencies details

Use @workspace to find all my significant contributions"
```

**Part 2: Handoff Prompts**
```
For each area, create prompt for new owner:

"I'm taking over [module] from [previous developer].
Here's the context: [paste context]

Help me:
1. Understand the current implementation
2. Identify areas needing attention
3. Learn the patterns used
4. Know what's in progress
5. Understand future plans"
```

**Provide complete knowledge transfer workflow"
```

---

### Team Learning Sessions

```
"Create weekly learning session format:

**Weekly Tech Talk with Copilot:**

**Format:**
1. Pick a topic (e.g., 'Performance Optimization')
2. Use Copilot to generate learning content
3. Apply to our codebase
4. Document learnings

**Example Session: Performance**

**Preparation (Individual):**
```
"Analyze our codebase for performance issues:
@workspace find slow queries, N+1 problems, missing indexes

Generate a list of top 10 performance improvements"
```

**Session (Team):**
1. Review findings together
2. Pick 2-3 to fix as group
3. Use Copilot to implement
4. Discuss trade-offs

**Post-Session:**
```
"Document today's performance improvements:
- What we found
- What we fixed
- Metrics before/after
- Patterns to apply elsewhere

Generate team wiki page"
```

**Topics:**
- Week 1: Performance
- Week 2: Security
- Week 3: Testing
- Week 4: Architecture

**Provide:**
- Session templates
- Topic prompts
- Documentation format"
```

---

## Prochaines Étapes

Collaboration et CI/CD maîtrisés ! Consultez enfin :

- [09_Prompt_Library.md](09_Prompt_Library.md) - 50+ prompts prêts à utiliser

---

*Dernière mise à jour : Décembre 2025*
