# Sécurité et Qualité du Code

## Table des Matières
1. [Audits de Sécurité](#audits-de-securite)
2. [Qualité du Code](#qualite-du-code)
3. [Testing Strategy](#testing-strategy)
4. [Performance](#performance)
5. [Compliance](#compliance)

---

## Audits de Sécurité

### 🔒 Audit de Sécurité Complet

#### Template d'Audit Global

```
"Comprehensive security audit of my application:

**Scope:** [Full app / Specific module]

**OWASP Top 10 Check:**
1. Injection (SQL, NoSQL, Command)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

For each vulnerability found:
- **Severity**: Critical / High / Medium / Low
- **Location**: File:line
- **Description**: What's vulnerable
- **Exploit**: How it could be exploited
- **Impact**: What damage could occur
- **Fix**: Exact code to fix it
- **Prevention**: How to avoid in future

Prioritize by: Critical (fix now) > High (fix this week) > Medium > Low"
```

---

### Authentication & Authorization

#### JWT Implementation Audit

```
"Audit JWT authentication implementation in backend/src/auth:

**Check:**
1. **Token Generation:**
   - Secret key source (env variable?)
   - Secret strength (>= 256 bits?)
   - Token expiration time (reasonable?)
   - Payload content (no sensitive data?)
   - Signing algorithm (HS256/RS256?)

2. **Token Verification:**
   - Signature verified?
   - Expiration checked?
   - Issuer validated?
   - Algorithm specified (prevents 'none' attack)?

3. **Token Storage:**
   - Where stored client-side?
   - HttpOnly cookies?
   - Secure flag set?
   - SameSite attribute?

4. **Refresh Tokens:**
   - Implemented?
   - Rotation strategy?
   - Stored securely?
   - Revocation mechanism?

5. **Common Vulnerabilities:**
   - JWT confusion attack?
   - Token replay attack?
   - XSS token theft?
   - CSRF protection?

For each issue, provide:
- Current vulnerable code
- Fixed secure code
- Explanation of vulnerability
- Test to verify fix"
```

#### Password Security Audit

```
"Audit password handling:

**Check:**
1. **Hashing:**
   - Algorithm used (bcrypt/argon2/scrypt)?
   - Salt rounds (>= 10 for bcrypt)?
   - Unique salt per password?
   - Timing attack protection?

2. **Validation:**
   - Minimum length (>= 8)?
   - Complexity requirements?
   - Common password checking?
   - Max length (prevent DoS)?

3. **Storage:**
   - Never stored plain text?
   - Never logged?
   - Never in error messages?
   - Not in JWT payload?

4. **Reset Flow:**
   - Secure token generation?
   - Token expiration?
   - Token single-use?
   - Rate limiting on reset requests?
   - Email verification?

5. **Login Security:**
   - Account lockout after N failed attempts?
   - Rate limiting?
   - Timing attack prevention (constant-time compare)?
   - Brute force protection?

Show vulnerable code and fixes with examples"
```

---

### Input Validation & Injection Prevention

#### Comprehensive Input Validation Audit

```
"Audit all API endpoints for input validation:

**Scan for:**
1. **Missing Validation:**
   - @Body() without validation decorator
   - Query parameters unchecked
   - Path parameters not validated
   - Headers used without validation

2. **SQL Injection:**
   - Raw SQL queries?
   - String concatenation in queries?
   - User input in SQL?
   - Prisma misuse (raw queries)?

3. **NoSQL Injection:**
   - MongoDB query operators from user input?
   - $where usage?
   - Unvalidated filters?

4. **Command Injection:**
   - exec(), spawn(), system() calls?
   - User input in shell commands?
   - File paths from user input?

5. **XSS Prevention:**
   - User content rendered without escaping?
   - innerHTML usage?
   - Unsafe HTML attributes?

**For each endpoint:**
- Method and path
- Input parameters
- Validation status (✅/❌)
- Vulnerability if any
- Fix required

Generate a validation scorecard"
```

#### Zod Validation Implementation

```
"Implement comprehensive Zod validation for #file:[dto-path]:

**Requirements:**
1. **String Fields:**
   - Min/max length
   - Format (email, URL, UUID)
   - Trim whitespace
   - Pattern matching if needed

2. **Number Fields:**
   - Min/max values
   - Integer vs float
   - Positive only if applicable

3. **Enum Fields:**
   - Allowed values list
   - Case sensitivity

4. **Array Fields:**
   - Min/max items
   - Item validation
   - Unique items if needed

5. **Object Fields:**
   - Nested validation
   - Optional vs required
   - Default values

6. **Custom Validation:**
   - Business rules
   - Cross-field validation
   - Async validation if needed

**Error Messages:**
- User-friendly
- Specific to failure
- Don't expose internals

Provide complete Zod schema with tests"
```

---

### Data Protection & Privacy

#### Sensitive Data Audit

```
"Audit for sensitive data exposure:

**Scan for:**
1. **Logging:**
   - Passwords logged?
   - Tokens logged?
   - PII in logs?
   - Credit card data?
   - API keys?

2. **Error Messages:**
   - Stack traces to client?
   - Database errors exposed?
   - Internal paths revealed?
   - Version info leaked?

3. **API Responses:**
   - Password hashes returned?
   - Other users' data?
   - More data than needed?
   - Debug info in production?

4. **Database:**
   - Passwords encrypted?
   - PII encrypted at rest?
   - Encryption key management?
   - Access controls?

5. **Transmission:**
   - HTTPS only?
   - TLS version (>= 1.2)?
   - Certificate validation?
   - HSTS header?

**For each issue:**
- Location
- What's exposed
- Risk level
- Fix implementation
- Verification test"
```

#### GDPR Compliance Check

```
"GDPR compliance audit:

**Data Subject Rights:**
1. **Right to Access:**
   - Endpoint to export user data?
   - All user data included?
   - Format machine-readable?
   - Response within 30 days?

2. **Right to Erasure:**
   - Delete account endpoint?
   - Cascade delete all user data?
   - Anonymize vs delete?
   - Retention policy respected?

3. **Right to Rectification:**
   - User can update data?
   - Validation on updates?
   - Audit trail?

4. **Data Portability:**
   - Export in standard format?
   - JSON/CSV options?
   - Includes all data?

**Consent:**
5. **Consent Tracking:**
   - Consent recorded?
   - Timestamp?
   - What was consented to?
   - Withdrawable?

**Technical Measures:**
6. **Privacy by Design:**
   - Data minimization?
   - Purpose limitation?
   - Storage limitation?
   - Encryption?

7. **Breach Notification:**
   - Detection mechanisms?
   - Notification process?
   - Logging adequate?

Provide implementation for missing requirements"
```

---

## Qualité du Code

### Code Quality Audit

#### Comprehensive Code Review

```
"Code quality audit of [module/file]:

**Complexity:**
- Functions > 50 lines (list them)
- Cyclomatic complexity > 10
- Nesting depth > 4
- Too many parameters (> 5)

**Code Smells:**
- Duplicate code
- Long parameter lists
- Large classes
- God objects
- Inappropriate intimacy
- Feature envy

**SOLID Principles:**
- Single Responsibility violations
- Open/Closed violations
- Liskov Substitution violations
- Interface Segregation violations
- Dependency Inversion violations

**Readability:**
- Unclear variable names
- Magic numbers
- Missing comments for complex logic
- Inconsistent formatting
- Too many nested callbacks

**Error Handling:**
- Try-catch without specific error handling
- Swallowed exceptions
- Generic error messages
- No error logging

**For top 10 issues:**
- Severity and priority
- Current code
- Refactored code
- Explanation of improvement
- Impact on maintainability

Generate refactoring plan"
```

---

### TypeScript Type Safety

#### Type Safety Audit

```
"TypeScript type safety audit:

**Check for:**
1. **`any` Usage:**
   - Find all `any` types
   - Can they be made specific?
   - Create proper types

2. **Type Assertions:**
   - `as` casting
   - Are they necessary?
   - Can be avoided with better typing?

3. **Optional Chaining Overuse:**
   - ?. operators
   - Should field be required instead?
   - Better null handling?

4. **Union Types:**
   - Discriminated unions used properly?
   - Type guards implemented?

5. **Generics:**
   - Used where appropriate?
   - Constraints added?
   - Type inference working?

6. **Unknown vs Any:**
   - `unknown` used instead of `any`?
   - Type narrowing implemented?

**Provide:**
- Current weak typing
- Improved strong typing
- Type guards if needed
- Utility types to create"
```

---

### Error Handling Best Practices

#### Error Handling Audit

```
"Audit error handling across the application:

**Check:**
1. **Custom Exceptions:**
   - Domain-specific exceptions defined?
   - Extend base Error properly?
   - Include relevant context?

2. **Try-Catch Usage:**
   - Only where errors expected?
   - Specific error types caught?
   - Errors not swallowed?
   - Finally blocks for cleanup?

3. **Error Responses:**
   - Consistent format?
   - Appropriate HTTP status codes?
   - User-friendly messages?
   - Error codes for client handling?
   - No sensitive data exposed?

4. **Error Logging:**
   - All errors logged?
   - Appropriate log level?
   - Context included (user, request)?
   - Stack traces in dev only?

5. **Async Error Handling:**
   - Promises rejected properly?
   - Async functions wrapped?
   - Unhandled rejection handler?

6. **Validation Errors:**
   - Field-specific messages?
   - All validation errors returned (not just first)?
   - 400 status code?

**Provide:**
- Error handling strategy
- Custom exception classes
- Exception filter (NestJS)
- Error logging setup
- Examples for each error type"
```

---

## Testing Strategy

### Test Coverage Analysis

```
"Analyze test coverage and generate missing tests:

**Current Coverage:**
- Lines covered: ?%
- Branches covered: ?%
- Functions covered: ?%
- Files with <80% coverage?

**Priority Testing:**
1. **Critical Paths:**
   - Authentication flow
   - Payment processing
   - Data mutations
   - Authorization checks

2. **Complex Logic:**
   - Functions with high complexity
   - Business rule implementations
   - Algorithms

3. **Edge Cases:**
   - Boundary values
   - Null/undefined handling
   - Empty arrays/objects
   - Concurrent operations

4. **Error Scenarios:**
   - Database failures
   - External API failures
   - Validation failures
   - Network timeouts

**Generate tests for:**
- Top 10 untested critical functions
- All authentication/authorization
- All data mutations
- Payment flows

Provide complete test suites"
```

---

### Test Quality Audit

```
"Audit existing tests for quality:

**Check for:**
1. **Test Structure:**
   - AAA pattern (Arrange, Act, Assert)?
   - One assertion per test?
   - Clear test names?
   - Proper describe/it nesting?

2. **Test Independence:**
   - Tests don't depend on each other?
   - Can run in any order?
   - Clean state before each?

3. **Mocking:**
   - External dependencies mocked?
   - Database mocked in unit tests?
   - Mocks realistic?
   - Not over-mocking?

4. **Assertions:**
   - Specific assertions?
   - Testing behavior, not implementation?
   - Edge cases covered?
   - Error cases tested?

5. **Test Data:**
   - Realistic test data?
   - Data factories used?
   - No hardcoded IDs?
   - Clean data setup?

6. **Performance:**
   - Tests fast (<5s total)?
   - No unnecessary delays?
   - Parallel execution?

**Provide:**
- Test quality score
- Specific improvements for poor tests
- Best practice examples"
```

---

### E2E Testing Strategy

```
"Create comprehensive E2E testing strategy:

**Critical User Journeys:**
1. User Registration & Login
2. Create and Manage Programs
3. Track Workouts
4. Subscription Upgrade/Downgrade
5. Password Reset
6. Profile Management

For each journey:
**Playwright Test:**
- Happy path
- Error scenarios
- Edge cases
- Performance assertions
- Accessibility checks

**Test Data:**
- Setup and teardown
- Test user creation
- Clean database state

**Configuration:**
- Test environment setup
- Browser configurations
- Screenshot on failure
- Video recording

**CI Integration:**
- Run on PR
- Parallel execution
- Retry flaky tests
- Report generation

Provide complete E2E test suite template"
```

---

## Performance

### Performance Audit

```
"Performance audit of [endpoint/module]:

**Analyze:**
1. **Database Queries:**
   - Run EXPLAIN ANALYZE
   - N+1 queries?
   - Missing indexes?
   - Unnecessary joins?
   - SELECT * usage?

2. **API Calls:**
   - External API calls in loop?
   - Sequential vs parallel?
   - Timeout configured?
   - Retry logic?
   - Caching possible?

3. **Computation:**
   - Heavy computations in request path?
   - Can be cached?
   - Can be async/background?
   - Algorithm complexity?

4. **Memory:**
   - Large objects loaded?
   - Memory leaks?
   - Pagination implemented?
   - Streaming for large data?

5. **Response Size:**
   - Unnecessary data returned?
   - Compression enabled?
   - Pagination?
   - Field selection?

**Provide:**
- Current performance baseline
- Bottleneck identification
- Optimization recommendations
- Expected improvement
- Implementation code
- Before/after benchmarks"
```

---

### Database Optimization

```
"Optimize database queries in [file]:

**Analysis:**
1. **Current Queries:**
   - Extract all Prisma queries
   - Run EXPLAIN for each
   - Identify slow queries (>100ms)

2. **N+1 Detection:**
   - Queries in loops?
   - Missing includes?
   - Should use select?

3. **Index Analysis:**
   - Current indexes
   - Missing indexes for:
     * Foreign keys
     * WHERE clause columns
     * ORDER BY columns
     * Frequently joined columns

4. **Query Structure:**
   - Unnecessary data fetched?
   - Can use pagination?
   - Aggregations efficient?
   - Transactions used appropriately?

**Optimizations:**
- Prisma query improvements
- Index creation migrations
- Caching strategy (Redis)
- Query result pagination
- Connection pooling config

**Provide:**
- Optimized queries
- Migration files
- Performance comparison
- Monitoring queries"
```

---

### Caching Strategy

```
"Implement caching strategy for [feature]:

**Analysis:**
1. **What to Cache:**
   - Frequently accessed data
   - Expensive computations
   - External API responses
   - Rarely changing data

2. **Cache Keys:**
   - Format: entity:id:context
   - Hierarchical keys
   - Wildcards for invalidation

3. **TTL Strategy:**
   - Short TTL (1-5 min): frequently changing
   - Medium TTL (5-30 min): stable data
   - Long TTL (hours): static data

4. **Invalidation:**
   - On create/update/delete
   - Pattern-based invalidation
   - Cascade invalidation

**Implementation:**
- Redis setup
- Caching decorator/middleware
- Cache aside pattern
- Write-through pattern
- Cache warming
- Monitoring (hit/miss rates)

**Error Handling:**
- Graceful degradation if Redis down
- Circuit breaker
- Logging

Provide complete caching implementation"
```

---

## Compliance

### Dependency Security Audit

```
"Audit npm dependencies for security:

**Check:**
1. **Known Vulnerabilities:**
   - Run npm audit
   - Check severity levels
   - Exploitability

2. **Outdated Packages:**
   - Packages >2 years old?
   - No longer maintained?
   - Better alternatives?

3. **Package Licenses:**
   - Copyleft licenses (GPL)?
   - Compatible with our license?
   - Attribution requirements?

4. **Package Trust:**
   - Download count
   - Maintainer reputation
   - Recent updates
   - Test coverage

5. **Unnecessary Dependencies:**
   - Unused packages
   - Dev dependencies in prod
   - Duplicate functionality

**Provide:**
- Vulnerability report (Critical/High priority)
- Update recommendations
- Migration guides for major updates
- License compatibility matrix
- Cleanup recommendations"
```

---

### Production Readiness Checklist

```
"Production readiness audit:

**Security:**
- [ ] No hardcoded secrets
- [ ] Environment variables validated
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] CSRF protection
- [ ] Secure headers set

**Performance:**
- [ ] Database indexes optimized
- [ ] Caching implemented
- [ ] Connection pooling configured
- [ ] Static assets CDN
- [ ] Response compression
- [ ] Pagination on large datasets

**Monitoring:**
- [ ] Error logging (Sentry/etc)
- [ ] Performance monitoring (APM)
- [ ] Health check endpoint
- [ ] Uptime monitoring
- [ ] Alert configuration
- [ ] Log aggregation

**Reliability:**
- [ ] Graceful shutdown
- [ ] Circuit breakers
- [ ] Retry logic
- [ ] Timeouts configured
- [ ] Database migrations tested
- [ ] Backup strategy
- [ ] Rollback plan

**Testing:**
- [ ] Unit test coverage >80%
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Load testing done
- [ ] Security testing done

**Documentation:**
- [ ] API documentation complete
- [ ] README up-to-date
- [ ] Deployment guide
- [ ] Runbook for common issues
- [ ] Architecture documented

Generate detailed report with status and fixes needed"
```

---

## Prochaines Étapes

Sécurité et qualité maîtrisées ! Continuez avec :

- [06_Advanced_Techniques.md](06_Advanced_Techniques.md) - Techniques avancées
- [07_SaaS_Patterns.md](07_SaaS_Patterns.md) - Patterns spécifiques SaaS

---

*Dernière mise à jour : Décembre 2025*
