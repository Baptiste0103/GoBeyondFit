# Bibliothèque de Prompts - Copy & Paste

## Table des Matières
1. [Sécurité](#securite)
2. [Performance](#performance)
3. [Refactoring](#refactoring)
4. [Testing](#testing)
5. [Documentation](#documentation)
6. [Database](#database)
7. [API Development](#api-development)
8. [Debugging](#debugging)
9. [Architecture](#architecture)
10. [SaaS Patterns](#saas-patterns)

---

## 🔒 Sécurité

### 1. Audit de Sécurité Complet
```
"Comprehensive security audit of backend/src:

**OWASP Top 10 Check:**
1. Injection (SQL, NoSQL, Command)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

For each vulnerability found:
- Severity: Critical/High/Medium/Low
- Location: File:line
- Description
- Exploit scenario
- Fix with code

Prioritize Critical and High severity issues"
```

### 2. JWT Security Review
```
"Audit JWT implementation in backend/src/auth:

Check:
1. Token generation (secret strength, expiration)
2. Signature verification
3. Algorithm security (no 'none' allowed)
4. Token storage recommendations
5. Refresh token implementation
6. XSS/CSRF protection

Provide:
- Vulnerabilities found
- Secure implementation
- Best practices"
```

### 3. Input Validation Audit
```
"Audit all API endpoints for input validation:

Scan for:
- Missing validation decorators
- SQL/NoSQL injection risks
- Command injection
- XSS vulnerabilities
- Path traversal

For each endpoint:
- Method and path
- Parameters
- Validation status
- Vulnerabilities
- Fix required

Generate validation scorecard with Zod schemas"
```

### 4. Secrets Detection
```
"Scan codebase for hardcoded secrets:

Find:
- API keys
- Database passwords
- JWT secrets
- Encryption keys
- Service credentials
- URLs with credentials

Provide:
- File:line for each finding
- Severity
- How to fix (use environment variables)
- .env.example template"
```

### 5. Dependencies Security Audit
```
"Audit npm dependencies for security:

Check:
1. npm audit results
2. Known vulnerabilities (CVE)
3. Outdated packages (>2 years)
4. Unmaintained dependencies
5. License compliance

Provide:
- Critical vulnerabilities (fix immediately)
- High priority updates
- Update commands
- Breaking change warnings"
```

---

## ⚡ Performance

### 6. Performance Audit
```
"Performance audit of [ENDPOINT/MODULE]:

Analyze:
1. Database queries (EXPLAIN ANALYZE)
2. N+1 query detection
3. Missing indexes
4. External API calls
5. Heavy computations
6. Memory usage

Provide:
- Current baseline metrics
- Bottlenecks with evidence
- Optimization recommendations
- Expected improvement %
- Implementation code"
```

### 7. Database Query Optimization
```
"Optimize database queries in #file:[PATH]:

Analysis:
1. Extract all Prisma queries
2. Run EXPLAIN for slow queries (>100ms)
3. Identify N+1 queries
4. Check for SELECT *
5. Evaluate index usage

Optimizations:
- Rewrite inefficient queries
- Add proper indexes (with migrations)
- Implement query result caching
- Add pagination where needed

Show before/after with performance metrics"
```

### 8. Caching Strategy Implementation
```
"Implement Redis caching for [FEATURE]:

Requirements:
- Cache key format: entity:id:context
- TTL strategy per data type
- Invalidation on create/update/delete
- Graceful degradation if Redis down
- Hit/miss rate monitoring

Provide:
- Redis setup
- Caching middleware
- Invalidation logic
- Error handling
- Unit tests"
```

### 9. API Response Optimization
```
"Optimize API responses for [ENDPOINT]:

Check:
1. Unnecessary data in responses
2. Missing pagination
3. Large nested objects
4. No field selection
5. Missing compression

Implement:
- Response field selection (sparse fieldsets)
- Pagination (cursor-based)
- Response compression
- Partial responses

Show before/after payload sizes"
```

### 10. Load Testing Setup
```
"Create load testing strategy for [FEATURE]:

Requirements:
- Expected load: [X] concurrent users
- Critical endpoints: [list]
- Success criteria: p95 < 200ms, error rate < 0.1%

Provide:
- k6 test scripts
- Realistic test scenarios
- Ramp-up strategy
- Monitoring during test
- Results analysis template"
```

---

## 🔄 Refactoring

### 11. Code Quality Audit
```
"Code quality audit of #file:[PATH]:

Check:
1. Complexity (cyclomatic > 10)
2. Function length (> 50 lines)
3. Code duplication
4. SOLID principle violations
5. Code smells

For top 10 issues:
- Current code
- Refactored code
- Complexity improvement
- Explanation

Generate refactoring plan with priorities"
```

### 12. Extract Functions Refactoring
```
"Refactor #file:[PATH] to extract helper functions:

Current issues:
- Functions > 50 lines
- Complexity > 10
- Nested conditionals

Extract:
- Validation logic → validateInput()
- Business rules → applyBusinessRules()
- Data transformation → transformData()
- Error handling → handleSpecificError()

Requirements:
- Each function < 30 lines
- Single responsibility
- Testable independently
- TypeScript strict mode"
```

### 13. Remove Code Duplication
```
"Find and remove code duplication in [MODULE]:

Steps:
1. Identify duplicate code blocks
2. Extract to shared utilities
3. Create abstractions where needed
4. Update all usages
5. Ensure tests still pass

Provide:
- Duplication report
- Extracted utilities
- Migration guide
- Updated imports"
```

### 14. Dependency Injection Refactoring
```
"Refactor #file:[PATH] to use dependency injection:

Current: Direct imports of dependencies
Target: Constructor injection (NestJS)

Steps:
1. Identify dependencies
2. Create interfaces
3. Update constructors
4. Update module providers
5. Update tests with mocks

Provide:
- Refactored code
- Interface definitions
- Module updates
- Test updates"
```

### 15. Error Handling Standardization
```
"Standardize error handling in [MODULE]:

Create:
1. Custom exception classes
2. Exception filter (NestJS)
3. Consistent error responses
4. Error logging strategy

Update all try-catch blocks to use:
- Specific exception types
- Proper error codes
- User-friendly messages
- Structured logging

Provide complete implementation"
```

---

## 🧪 Testing

### 16. Generate Unit Tests
```
"/tests comprehensive unit tests for #file:[PATH]

Requirements:
- Test all public methods
- Mock all dependencies (Prisma, external services)
- Edge cases and boundary values
- Error scenarios
- Use Jest
- AAA pattern (Arrange, Act, Assert)
- >80% coverage

Include:
- Test setup and teardown
- Mock factories
- Test data builders"
```

### 17. Generate Integration Tests
```
"/tests integration tests for #file:[CONTROLLER-PATH]

Requirements:
- Test all endpoints
- Use Supertest
- Test database via test container
- Authentication scenarios
- Validation errors
- Success and error responses

Setup:
- Test database
- Seed test data
- Cleanup after tests"
```

### 18. Generate E2E Tests
```
"Generate Playwright E2E tests for [USER JOURNEY]:

Journey steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Requirements:
- Happy path
- Error scenarios
- Edge cases
- Page Object Model
- Accessibility checks
- Screenshots on failure

Provide complete E2E test suite"
```

### 19. Test Data Factories
```
"Create test data factories for entities:

Entities: User, Program, Workout, Exercise

Requirements:
- Realistic test data
- Customizable fields
- Relationships handled
- Unique values (emails, etc.)
- TypeScript types

Example usage:
```typescript
const user = await userFactory.create({ email: 'test@example.com' });
const program = await programFactory.create({ userId: user.id });
```

Provide complete factory implementation"
```

### 20. Increase Test Coverage
```
"Analyze test coverage and generate missing tests:

Current coverage: [X]%
Target: 80%+

Priority:
1. Untested critical paths
2. Complex business logic
3. Error handling
4. Edge cases

Generate tests for:
- Top 10 untested functions
- All authentication flows
- All payment processing
- All data mutations

Provide test suites with explanations"
```

---

## 📚 Documentation

### 21. Generate API Documentation
```
"/doc Generate OpenAPI 3.0 specification for [MODULE]:

Include:
- All endpoints with descriptions
- Request/response schemas
- Authentication requirements
- Error responses (400, 401, 403, 404, 500)
- Examples for each endpoint
- Rate limiting info

Export as swagger.json and host with Swagger UI"
```

### 22. Generate JSDoc Comments
```
"/doc Add comprehensive JSDoc for #file:[PATH]

Include:
- Function/class purpose
- Parameter descriptions with types
- Return type and description
- Throws exceptions
- Usage examples
- Since version
- See also links

Example:
```typescript
/**
 * Creates a new workout program
 * @param data - Program creation data
 * @returns The created program
 * @throws {ValidationError} If data invalid
 * @example
 * const program = await create({ name: 'Beginner' });
 */
```"
```

### 23. Generate README
```
"/doc Create comprehensive README.md for [MODULE]:

Include:
- Overview and purpose
- Features
- Installation
- Usage examples
- API reference
- Configuration
- Testing
- Contributing
- License

Format: GitHub-flavored Markdown
Audience: Other developers"
```

### 24. Architecture Documentation
```
"Generate architecture documentation:

Include:
1. System overview
2. Component diagram (text/ASCII)
3. Data flow diagrams
4. Database schema
5. API architecture
6. Security architecture
7. Deployment architecture

For each component:
- Purpose
- Technologies
- Interfaces
- Dependencies

Export as docs/architecture.md"
```

### 25. Changelog Generation
```
"Generate CHANGELOG.md from recent commits:

Format: Keep a Changelog (keepachangelog.com)

Sections:
- Added (new features)
- Changed (changes in existing functionality)
- Deprecated
- Removed
- Fixed (bug fixes)
- Security (vulnerabilities fixed)

Parse commits since last release (v[X.Y.Z])
Follow semantic versioning
Link to PRs and issues"
```

---

## 🗄️ Database

### 26. Generate Prisma Schema
```
"Create Prisma schema for [ENTITY]:

Requirements:
- Fields: [list with types]
- Relationships: [list]
- Indexes on: [fields]
- Unique constraints: [fields]
- Default values where appropriate
- Timestamps (createdAt, updatedAt)

Include:
- Proper types
- Relations with cascade
- Comments for complex fields
- @@index and @@unique directives"
```

### 27. Generate Database Migration
```
"Generate Prisma migration for [CHANGE]:

Change: [description]

Requirements:
- Backward compatible if possible
- Data migration if needed
- Rollback script
- Estimated duration
- Impact analysis

Provide:
- Migration file
- Data migration script (if needed)
- Rollback procedure
- Testing checklist"
```

### 28. Database Index Optimization
```
"Optimize database indexes for [TABLE]:

Analyze:
1. Current indexes
2. Query patterns (WHERE, ORDER BY, JOIN)
3. Slow queries (>100ms)
4. Missing indexes
5. Unused indexes

Provide:
- Index recommendations
- Migration to add indexes
- Expected performance improvement
- Trade-offs (write performance)"
```

### 29. Database Query Analysis
```
"Analyze and optimize this Prisma query:

```typescript
[PASTE QUERY]
```

Analyze:
1. EXPLAIN ANALYZE output
2. N+1 query check
3. Unnecessary data fetched
4. Missing includes/selects
5. Index usage

Provide:
- Optimized query
- Performance comparison
- Explanation of improvements"
```

### 30. Database Seeding
```
"Create database seeding script:

Seed data for:
- Users (admin, regular users)
- [Other entities]

Requirements:
- Realistic data
- Relationships properly linked
- Idempotent (can run multiple times)
- Environment-specific (dev/staging)

Provide:
- Seeding script
- How to run
- How to reset database"
```

---

## 🚀 API Development

### 31. Generate CRUD Endpoints
```
"Generate complete CRUD API for [ENTITY]:

Endpoints:
- POST / - Create
- GET / - List (with pagination, filtering, sorting)
- GET /:id - Get one
- PATCH /:id - Update
- DELETE /:id - Delete

Include:
- NestJS controller
- Service layer
- DTOs with Zod validation
- Swagger decorators
- Auth guards
- Error handling
- Logging

Follow patterns in #file:users/users.controller.ts"
```

### 32. Add Pagination
```
"Add pagination to GET [ENDPOINT]:

Requirements:
- Cursor-based pagination (not offset)
- Limit: 10 (default), max 100
- Include total count
- Next/previous cursors
- Sorting support

Response format:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 10,
    "nextCursor": "abc123",
    "prevCursor": "xyz789"
  }
}
```

Provide complete implementation"
```

### 33. Add Filtering
```
"Add advanced filtering to GET [ENDPOINT]:

Filters:
- [field1]: exact match
- [field2]: range (min/max)
- [field3]: array (any of)
- search: full-text search
- [field4]: boolean

Query string format:
?field1=value&field2_min=10&field2_max=100&field3=val1,val2

Include:
- Query builder
- Type-safe filter DTO
- Prisma where clause generation
- Validation"
```

### 34. Add Sorting
```
"Add sorting to GET [ENDPOINT]:

Sort by: [field1], [field2], [field3]
Order: asc, desc

Query string: ?sortBy=field1&order=desc

Multiple sorts: ?sort=field1:asc,field2:desc

Provide:
- Sorting DTO
- Query parser
- Prisma orderBy generation
- Validation (only allowed fields)"
```

### 35. Rate Limiting Implementation
```
"Implement rate limiting with @nestjs/throttler:

Requirements:
- Global: 100 requests/minute
- Per endpoint overrides:
  * [endpoint1]: 10/minute
  * [endpoint2]: 5/minute
- Per user (JWT)
- Redis storage for distributed
- Custom headers (X-RateLimit-*)
- Clear error messages

Provide complete implementation with examples"
```

---

## 🐛 Debugging

### 36. Debug Error
```
"Debug this error:

**Error:** [PASTE ERROR MESSAGE/STACK TRACE]

**Context:**
- File: #file:[PATH]
- What I'm trying to do: [action]
- Expected: [expected behavior]
- Actual: [actual behavior]
- Recent changes: [if any]

Analyze:
1. Root cause
2. Why it's happening
3. How to fix
4. How to prevent
5. Test to add

Provide step-by-step debugging and fix"
```

### 37. Debug Performance Issue
```
"Debug performance issue in [ENDPOINT]:

**Problem:**
- Current response time: [X]ms
- Target: <200ms
- Affects [X]% of requests

**Context:**
- Endpoint: [METHOD /path]
- Request payload: [example]
- Database: [size, indexes]

Analyze:
1. Profile the endpoint
2. Identify bottlenecks
3. Suggest optimizations
4. Implement fixes
5. Verify improvement

Provide performance analysis and fix"
```

### 38. Debug Memory Leak
```
"Debug potential memory leak:

**Symptoms:**
- Memory usage grows over time
- GC doesn't free memory
- Server crashes after [X] hours

**Context:**
- Node version: [version]
- Heap size: [size]
- Affected endpoints: [list]

Steps:
1. Identify leak source
2. Analyze heap snapshots
3. Find retained objects
4. Provide fix
5. Add monitoring

Provide analysis and solution"
```

### 39. Debug Database Query
```
"Debug slow database query:

**Query:** [PASTE PRISMA QUERY]

**Problem:**
- Takes [X]ms
- Should be <100ms

Analyze:
1. EXPLAIN ANALYZE output
2. Query plan
3. Index usage
4. Table sizes
5. Optimization opportunities

Provide:
- Analysis
- Optimized query
- Index recommendations
- Expected improvement"
```

### 40. Debug TypeScript Error
```
"Debug TypeScript error:

**Error:** [EXACT ERROR MESSAGE]
**File:** #file:[PATH]:[LINE]

**Code context:**
```typescript
[PASTE CODE SNIPPET]
```

Explain:
1. Why error occurs
2. Type mismatch details
3. 2-3 fix options
4. Best fix with explanation
5. Updated code

Provide clear explanation and solution"
```

---

## 🏗️ Architecture

### 41. Design System Architecture
```
"Design architecture for [SYSTEM/FEATURE]:

**Requirements:**
- [Functional requirements]
- Scale: [expected load]
- Constraints: [technical, budget]

Provide:
1. Component diagram (text/ASCII)
2. Data flow
3. Technology choices (with justification)
4. Database schema
5. API design
6. Scalability strategy
7. Security measures
8. Monitoring approach

Deliverable: Complete architecture document"
```

### 42. Create ADR (Architectural Decision Record)
```
"Create ADR for [DECISION]:

**Context:**
[Situation and problem]

**Options:**
Generate 4-5 options with:
- Description
- Pros/cons (our context)
- Cost (time, money, complexity)
- Risks

**Decision:**
Recommend best with:
- Justification
- Trade-offs
- Why others rejected

**Consequences:**
- Positive
- Negative
- Mitigations

Format as docs/adr/[number]-[title].md"
```

### 43. Refactoring Strategy
```
"Create refactoring plan for [MODULE]:

**Current State:**
- Architecture
- Issues
- Metrics
- Pain points

**Target State:**
- Desired architecture
- Improvements
- Success metrics

**Strategy:**
- Big bang or incremental?
- Step-by-step plan
- Risk mitigation
- Rollback plan

**Execution:**
Each step:
- Independently deployable
- Tests pass
- No breaking changes
- Rollback possible

Provide detailed plan"
```

### 44. Microservices Migration Plan
```
"Plan migration from monolith to microservices:

**Current:** NestJS monolith
**Target:** Microservices architecture

**Analysis:**
1. Identify service boundaries
2. Data dependencies
3. Communication patterns
4. Migration strategy

**Services:**
For each service:
- Responsibilities
- Data ownership
- APIs
- Technology

**Migration Plan:**
- Strangler fig pattern
- Step-by-step
- No downtime
- Rollback at each step

Provide complete migration plan"
```

### 45. Event-Driven Architecture
```
"Design event-driven architecture for [USE CASE]:

**Events:**
Identify domain events: [examples]

**Components:**
1. Event producers
2. Message broker (Kafka/RabbitMQ/Redis)
3. Event consumers
4. Event store

**Implementation:**
- Event schemas
- Publishing
- Subscribing
- Error handling
- Event replay
- Monitoring

Provide:
- Architecture diagram
- Event definitions
- Code examples
- Trade-offs"
```

---

## 🏢 SaaS Patterns

### 46. Multi-Tenancy Implementation
```
"Implement multi-tenancy:

**Strategy:** Row-level security with tenant_id

**Requirements:**
- Tenant isolation
- Shared database
- Tenant context from JWT
- Auto-filtering by tenant
- Prevent cross-tenant access

Provide:
1. Database schema (Prisma)
2. Tenant context middleware
3. Prisma middleware for filtering
4. Authorization guards
5. Unit tests for isolation
6. Migration from single-tenant"
```

### 47. Subscription Billing (Stripe)
```
"Implement Stripe subscription billing:

**Tiers:** Free, Pro ($29/mo), Enterprise ($99/mo)

**Features:**
- Subscribe/upgrade/downgrade
- Prorated billing
- 14-day trial
- Payment method management
- Invoice history
- Failed payment handling
- Cancellation

Provide:
- Database schema
- SubscriptionService
- Webhook handler (all events)
- Rate limiting by tier
- Feature gating
- Frontend integration
- Complete tests"
```

### 48. Background Jobs (BullMQ)
```
"Implement background job system:

**Use Cases:**
- Send emails
- Generate reports
- Process uploads
- Cleanup tasks

**Requirements:**
- Redis-backed queues
- Retry logic
- Job monitoring
- Scheduled jobs
- Error handling
- Dead letter queue

Provide:
- Queue setup
- Job definitions
- Processors
- Monitoring dashboard
- Admin controls"
```

### 49. Webhook System
```
"Implement webhook system:

**Outgoing Webhooks:**
- Users register URLs
- Events: [list]
- Retry on failure
- Signature for security
- Delivery logs

**Incoming Webhooks:**
- Stripe, GitHub, etc.
- Signature verification
- Idempotency
- Async processing

Provide complete webhook implementation"
```

### 50. Email & Notifications
```
"Implement multi-channel notification system:

**Channels:**
- In-app (WebSocket)
- Email (SendGrid)
- Push notifications
- SMS (Twilio)

**Requirements:**
- User preferences per channel
- Notification center UI
- Real-time delivery
- Mark as read
- Templates
- Queue for sending
- Delivery tracking

Provide:
- Database schema
- NotificationService
- WebSocket gateway
- Email templates
- User preferences
- Complete implementation"
```

---

## 🎯 Quick Reference

### Most Used Prompts

**Daily:**
- #1: Security Audit
- #6: Performance Audit
- #16: Generate Tests
- #36: Debug Error

**Weekly:**
- #11: Code Quality Audit
- #21: API Documentation
- #26: Database Schema

**Before Deploy:**
- #1: Security Audit
- #5: Dependencies Audit
- #20: Test Coverage

**New Feature:**
- #31: CRUD Endpoints
- #46-50: SaaS Patterns
- #16-18: Testing

---

## 💡 Pro Tips

### Customizing Prompts

**Add Your Context:**
```
[Prompt from library]

Additional context for our project:
- Stack: [your stack]
- Patterns: See #file:[your-patterns-file]
- Standards: See docs/coding-standards.md
```

**Combine Prompts:**
```
First: [Prompt #31 - Generate CRUD]
Then: [Prompt #16 - Generate Tests]
Then: [Prompt #21 - Generate Docs]
```

**Make Templates:**
Save frequently used prompts in:
`.copilot/prompts/`

---

## 📖 Usage Guidelines

### When to Use Which Prompt

| Situation | Prompt # | Notes |
|-----------|----------|-------|
| New feature | 31, 46-50 | Start with CRUD or SaaS pattern |
| Bug fix | 36-40 | Choose by error type |
| Code review | 11, 1, 6 | Quality, security, performance |
| Documentation | 21-25 | API, code, architecture |
| Testing | 16-20 | Unit, integration, E2E |
| Refactoring | 11-15 | Quality first |
| Database | 26-30 | Schema, migration, optimization |
| Performance | 6-10 | Audit first, then optimize |
| Security | 1-5 | Regular audits |

---

## 🚀 Next Steps

You now have 50+ ready-to-use prompts!

**To maximize effectiveness:**
1. Bookmark this file
2. Try 1 new prompt per day
3. Customize for your project
4. Share successful prompts with team
5. Create your own prompt library

**Start now with:**
```
"Comprehensive security audit of backend/src..."
```

---

*Dernière mise à jour : Décembre 2025*
*Version : 1.0*
