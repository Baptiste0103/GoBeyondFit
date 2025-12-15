# Workflows de Productivité avec Copilot

## Table des Matières
1. [Workflow Quotidien](#workflow-quotidien)
2. [Développement de Fonctionnalités](#developpement-de-fonctionnalites)
3. [Debugging](#debugging)
4. [Refactoring](#refactoring)
5. [Workflows Spéciaux](#workflows-speciaux)

---

## Workflow Quotidien

### 🌅 Morning Routine (10 minutes)

#### 1. Revue du Code d'Hier
```
"Review all files I modified yesterday for:
- Potential bugs or issues
- Code that could be improved
- Missing tests or documentation
- TODO comments to address
Show prioritized list"
```

#### 2. Check TODOs
```
"@workspace find all TODO, FIXME, and HACK comments
Categorize by priority and file
Show top 5 most critical"
```

#### 3. Update Understanding
```
"What changed in the codebase recently?
@workspace summarize git changes from last 7 days
Focus on: backend/src"
```

---

### 💼 Starting a New Feature

**Before Writing Any Code:**

```
Step 1: "I need to implement [feature description]
Before coding, help me:
1. Check if similar functionality exists: @workspace
2. Identify files that will be affected
3. Suggest implementation approach
4. Identify potential challenges
5. Create step-by-step plan"

Step 2: [Review plan and adjust]

Step 3: "Let's start with Step 1: [first step from plan]"
```

**Exemple Concret :**
```
Step 1: "I need to implement user activity logging to track:
- User logins
- Workout completions
- Program creations
- Exercise additions

Before coding:
1. Check if we have any logging infrastructure: @workspace
2. What files need modification?
3. Database schema design
4. Performance implications (high-volume writes)
5. Implementation plan

Current stack: NestJS, Prisma, PostgreSQL"

[Copilot provides analysis and plan]

Step 2: "Start with database schema - create Prisma model for ActivityLog"

Step 3: "Now create the logging service with dependency injection"

[Continue step by step]
```

---

### 🔄 During Development

#### Pattern: Code → Review → Test → Document

**1. Implement**
```
[Write or generate code for the feature]
```

**2. Self-Review**
```
"Review the code I just wrote in #file:[path] for:
- Bugs or logical errors
- TypeScript type safety
- Error handling gaps
- Performance issues
- Security vulnerabilities
Provide specific fixes"
```

**3. Generate Tests**
```
"/tests comprehensive tests for #file:[path]
Include:
- Happy path
- Edge cases
- Error scenarios
- Integration tests if needed"
```

**4. Document**
```
"/doc add clear documentation for #file:[path]
Include:
- Function/class purpose
- Parameters and return types
- Usage examples
- Important notes or gotchas"
```

---

### 🏁 Before Committing

**Pre-Commit Checklist (via Copilot):**

```
"Pre-commit review of my changes:

Run these checks:
1. **Syntax/Type Errors**: Any TypeScript/ESLint errors?
2. **Code Quality**:
   - Functions >50 lines?
   - Duplicate code?
   - Complex conditionals?
3. **Security**:
   - Hardcoded secrets or URLs?
   - console.log with sensitive data?
   - Input validation missing?
4. **Tests**:
   - New code has tests?
   - Existing tests still pass?
5. **Documentation**:
   - Public APIs documented?
   - README updated if needed?
6. **Breaking Changes**:
   - Any API changes?
   - Database migrations?

Generate a pass/fail checklist"
```

---

### 🌙 End of Day

#### 1. Document Progress
```
"Summarize what I accomplished today based on my file changes.
Include:
- Features implemented
- Bugs fixed
- Files modified
- What's left to do tomorrow
Format as update for team standup"
```

#### 2. Plan Tomorrow
```
"Based on current progress, create tomorrow's task list:
- Priority 1 (must do)
- Priority 2 (should do)
- Priority 3 (nice to have)
Consider dependencies and blockers"
```

---

## Développement de Fonctionnalités

### Workflow Complet: De l'Idée à la Production

#### Phase 1: Planning (30 min)

**Step 1: Requirements Clarification**
```
"I want to add [feature]. Help me clarify requirements:

Functional:
- What should it do?
- Who will use it?
- What's the user flow?

Technical:
- Data model needed?
- API endpoints?
- Integration points?

Constraints:
- Performance requirements?
- Security considerations?
- Existing patterns to follow?

Ask me questions to refine the requirements"
```

**Step 2: Design Review**
```
"Design the architecture for [feature]:

Database:
- Schema design with Prisma
- Relationships and constraints
- Indexes needed

Backend:
- Service layer design
- Controller endpoints
- DTOs and validation
- Error handling strategy

Testing:
- What needs testing?
- Test data requirements

Provide:
- File structure
- Key decisions and trade-offs
- Implementation complexity estimate
- Potential risks"
```

#### Phase 2: Implementation (Iterative)

**Step 1: Database**
```
"Create Prisma schema for [entity]:
[Requirements]

Then generate migration with:
- Proper indexes
- Constraints
- Default values
- Comments for complex fields"
```

**Step 2: DTOs and Types**
```
"Create DTOs for [entity] with Zod validation:
- CreateDto: [fields]
- UpdateDto: [fields]
- QueryDto: [filters, pagination]
Include TypeScript types and validation rules"
```

**Step 3: Service Layer**
```
"Implement [entity]Service with:
- CRUD operations
- Business logic for [specific rules]
- Error handling with custom exceptions
- Prisma transactions where needed
- Logging

Follow pattern from #file:users/users.service.ts"
```

**Step 4: Controller**
```
"Implement [entity]Controller with REST endpoints:
- POST / - Create
- GET / - List (with pagination, filters)
- GET /:id - Get one
- PATCH /:id - Update
- DELETE /:id - Delete

Include:
- @ApiTags, @ApiOperation decorators
- Auth guards
- Validation pipes
- Proper HTTP status codes
- Error responses

Follow pattern from #file:users/users.controller.ts"
```

**Step 5: Tests**
```
"/tests comprehensive test suite for [entity]:

Unit Tests (service):
- Mock Prisma client
- Test all methods
- Edge cases and errors

Integration Tests (controller):
- Mock service layer
- Test endpoints with Supertest
- Authentication scenarios
- Validation errors

E2E Tests:
- Full flow tests
- Real database (test DB)
- Complete user scenarios"
```

#### Phase 3: Review & Polish

**Code Review**
```
"Review the complete [feature] implementation:

Files:
- #file:[entity].module.ts
- #file:[entity].controller.ts
- #file:[entity].service.ts
- #file:dto/
- #file:entities/

Check for:
1. Code quality and consistency
2. Error handling completeness
3. Performance issues
4. Security vulnerabilities
5. Test coverage gaps
6. Documentation needs

Provide specific improvements"
```

**Performance Check**
```
"Analyze [feature] for performance:
- Database queries - any N+1?
- Missing indexes?
- Caching opportunities?
- Pagination implemented?

Suggest optimizations with code"
```

**Security Audit**
```
"Security review of [feature]:
- Input validation complete?
- SQL injection risks?
- Authorization checks?
- Rate limiting needed?
- Sensitive data handling?

Show vulnerabilities and fixes"
```

#### Phase 4: Documentation

```
"/doc create comprehensive documentation for [feature]:

1. API Documentation (OpenAPI):
   - All endpoints
   - Request/response examples
   - Error responses
   - Authentication requirements

2. Code Documentation:
   - JSDoc for public methods
   - Complex logic explanations
   - Usage examples

3. README section:
   - Feature overview
   - How to use
   - Configuration
   - Testing instructions"
```

---

## Debugging

### Workflow de Debugging Systématique

#### Étape 1: Reproduire et Documenter

```
"I have a bug. Let me document it:

**Symptom:**
[What's wrong]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Messages:**
[Paste stack trace or error]

**Environment:**
- [Versions, config, etc.]

**Recent Changes:**
[What was changed recently]

Help me debug this systematically"
```

#### Étape 2: Hypothèses et Investigation

```
"Based on the bug description above:

1. Generate 3-5 hypotheses of root causes
2. For each hypothesis, suggest how to verify it
3. Prioritize by likelihood
4. Provide debugging steps for top hypothesis

Include specific:
- console.log statements to add
- Breakpoint locations
- Test queries to run"
```

#### Étape 3: Fix et Validation

```
"After investigation, the root cause is: [findings]

Provide:
1. The fix with explanation
2. Why this bug occurred
3. How to prevent similar bugs
4. Test case to prevent regression

Show code changes with #file: references"
```

---

### Debugging Patterns Spécifiques

#### Database Issues

```
"Debug database issue:

Problem: [Query slow/failing/wrong results]

Provide:
1. EXPLAIN ANALYZE for the query
2. Current indexes
3. Query optimization suggestions
4. Index recommendations with migrations
5. Before/after performance estimates

Query location: #file:[path]:[lines]"
```

#### API Errors

```
"Debug API error:

Endpoint: [METHOD /path]
Status: [error code]
Error: [message]
Request: [payload]

Analyze:
1. Request validation - is input valid?
2. Authentication - user context correct?
3. Authorization - permissions ok?
4. Business logic - any violated constraints?
5. Database - any constraint errors?
6. Response - error properly formatted?

Trace through #file:[controller] and #file:[service]"
```

#### TypeScript Errors

```
"Debug TypeScript error:

Error: [exact error message]
File: #file:[path]:[line]

Explain:
1. Why this error occurs
2. What types are incompatible
3. Provide fix options (2-3 approaches)
4. Recommend best fix with explanation
5. Show updated code"
```

---

## Refactoring

### Safe Refactoring Workflow

#### Phase 1: Analysis

```
"Analyze #file:[path] for refactoring:

Current State:
- Complexity metrics
- Code smells
- Duplication
- SOLID violations
- Test coverage

Refactoring Opportunities:
- Priority 1 (high impact)
- Priority 2 (medium impact)
- Priority 3 (low impact)

Risks:
- What could break?
- Dependencies on this code?
- Test coverage sufficient?

Create refactoring plan with steps"
```

#### Phase 2: Test Safety Net

```
"Before refactoring #file:[path], ensure test coverage:

Current tests: [if any]

Generate comprehensive tests:
- Current behavior tests (regression prevention)
- Edge cases
- Error scenarios
- Integration tests

These tests must pass before AND after refactoring"
```

#### Phase 3: Incremental Refactoring

```
"Refactor #file:[path] incrementally:

Step 1: [First refactoring]
- What changes
- Why it's safe
- How to verify

[Apply Step 1, run tests]

Step 2: [Next refactoring]
[Continue...]

Keep all tests passing after each step"
```

#### Phase 4: Verification

```
"After refactoring #file:[path]:

Verify:
1. All tests pass
2. No breaking changes to API
3. Performance not degraded
4. Code metrics improved:
   - Complexity reduced?
   - Duplication removed?
   - Readability better?

Compare before/after metrics"
```

---

### Large-Scale Refactoring

**Pattern: Strangler Fig**

```
"Plan large-scale refactoring of [module]:

Current Architecture:
[Description of current state]

Target Architecture:
[Description of desired state]

Strangler Fig Strategy:
1. Identify boundaries
2. Create new implementation alongside old
3. Route new requests to new code
4. Migrate old code gradually
5. Remove old code when done

Provide:
- Step-by-step migration plan
- How to maintain both versions
- Feature flag strategy
- Testing approach
- Rollback plan
- Estimated timeline"
```

---

## Workflows Spéciaux

### Workflow 1: Emergency Bug Fix

**When Production is Down**

```
Priority 1: "URGENT - Production bug:
[Error description]
[Impact: X users affected]
[Stack trace]

Fastest path to fix:
1. Root cause analysis
2. Minimal safe fix (not perfect, just working)
3. Side effects of fix?
4. Verification steps
5. Rollback plan if fix fails

Speed is critical. Show me the hotfix."
```

```
Priority 2: "After hotfix deployed:
1. Explain why bug occurred
2. Design proper long-term fix
3. Generate test to catch this bug
4. Review related code for similar issues
5. Add monitoring to detect early"
```

---

### Workflow 2: Code Review Response

```
"Here's PR feedback from code review:
[Paste review comments]

For each comment:
1. Locate in my code
2. Explain if valid concern
3. Implement fix or explain why not needed
4. Show updated code

Handle all feedback systematically"
```

---

### Workflow 3: Feature Flag Implementation

```
"Add feature flag for [feature]:

Requirements:
1. Config-based flag (environment variable)
2. Default value: [on/off]
3. Runtime toggleable via admin endpoint
4. Granular control:
   - All users
   - Percentage rollout
   - Specific user IDs/emails
   - A/B testing support

Implement:
- Flag configuration module
- Flag checking middleware
- Admin toggle endpoint
- Feature-flagged code wrapper
- Monitoring (flag usage metrics)
- Tests for both flag states"
```

---

### Workflow 4: Database Migration

```
"Plan safe database migration:

Change Needed:
[Description of schema change]

Safe Migration Strategy:
1. **Preparation Phase:**
   - Design migration
   - Create rollback plan
   - Test on staging
   - Backup strategy

2. **Migration Phase:**
   - Generate Prisma migration
   - Check for breaking changes
   - Data migration script (if needed)
   - Validation queries

3. **Verification Phase:**
   - Queries to verify success
   - Performance check
   - Data integrity check
   - Rollback test

4. **Cleanup Phase:**
   - Remove old columns/tables (after safety period)
   - Update documentation

Provide complete migration with all phases"
```

---

### Workflow 5: Performance Investigation

```
"Performance investigation for [endpoint/feature]:

**Baseline:**
- Current metrics: [response time, throughput, etc.]
- Target metrics: [goals]

**Investigation:**
1. Profile the code
2. Identify bottlenecks:
   - Database queries?
   - External API calls?
   - CPU-intensive operations?
   - Memory issues?
3. Measure impact of each bottleneck

**Optimization Plan:**
1. Quick wins (low effort, high impact)
2. Medium optimizations
3. Major refactoring (if needed)

**Verification:**
- How to measure improvement?
- Load testing approach
- Monitoring setup

Provide analysis and optimization code"
```

---

### Workflow 6: Security Audit

```
"Comprehensive security audit:

**Scope:**
[Module or full app]

**Audit Areas:**
1. **Authentication & Authorization:**
   - JWT implementation
   - Password handling
   - Session management
   - Role-based access control

2. **Input Validation:**
   - All endpoints checked?
   - SQL/NoSQL injection
   - XSS vulnerabilities
   - File upload security

3. **Data Protection:**
   - Encryption at rest
   - Encryption in transit
   - PII handling
   - Logging (no sensitive data?)

4. **Infrastructure:**
   - Environment variables
   - Secrets management
   - CORS configuration
   - Rate limiting

5. **Dependencies:**
   - Known vulnerabilities?
   - Outdated packages?

For each issue:
- Severity (Critical/High/Medium/Low)
- File and line number
- Description
- Fix recommendation
- CVE reference (if applicable)

Prioritized report with actionable fixes"
```

---

### Workflow 7: Test-Driven Development (TDD)

```
Phase 1: "Write test scenarios for [feature]:
- Happy path cases
- Edge cases
- Error cases
- Integration scenarios
Don't implement yet, just test scenarios"

Phase 2: "Generate failing tests for those scenarios"
[Tests are red]

Phase 3: "Implement minimal code to make tests pass"
[Tests turn green]

Phase 4: "Refactor the implementation while keeping tests green"
[Clean code, tests still green]

Phase 5: "Add more tests for edge cases discovered"
[Repeat cycle]
```

---

## Optimisation du Workflow

### Habitudes de Power User

#### 1. **Contexte Incrémental**
```
✅ Construisez le contexte progressivement
❌ Ne rechargez pas tout à chaque fois

"Focus on auth module only" → travaillez → quand fini:
"/clear
Now focus on payments module"
```

#### 2. **Batch Similar Tasks**
```
✅ Grouper les tâches similaires

Morning: Tous les bugs fixes
Afternoon: Nouvelle feature
End of day: Tests et documentation
```

#### 3. **Templates Réutilisables**
```
✅ Créer des prompts templates dans .copilot-templates.md

Copier-coller et remplir les blanks au lieu de réécrire
```

#### 4. **Keyboard Shortcuts**
```
✅ Maîtriser les raccourcis

Ctrl+Shift+I (chat) - utilisez 50x par jour
Tab (accept) - utilisez 200x par jour
Alt+] (next suggestion) - utilisez 50x par jour
```

#### 5. **Learn While Building**
```
✅ Après chaque génération de code, demandez:
"Explain why you chose this approach over alternatives"
"What are the trade-offs?"

Cela vous apprend à mieux coder
```

---

## Métriques de Productivité

### Mesurer Votre Efficacité

**Track These Metrics:**
- Lines of code written (manual vs generated)
- Time saved per feature
- Bugs caught before commit
- Test coverage increase
- Code reviews passed first time

**Goal:** Copilot should 3-5x your productivity

---

## Prochaines Étapes

Vous avez maintenant des workflows pour chaque situation ! Approfondissez avec :

- [05_Security_Quality.md](05_Security_Quality.md) - Sécurité et qualité du code
- [07_SaaS_Patterns.md](07_SaaS_Patterns.md) - Patterns spécifiques SaaS

---

*Dernière mise à jour : Décembre 2025*
