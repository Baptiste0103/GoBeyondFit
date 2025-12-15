# 🔒 SECURITY FIRST Checklist

## Mandatory Pre-Implementation Security Checklist

**STOP!** Before implementing ANY feature, complete this checklist.

**Purpose:** Prevent security vulnerabilities from being introduced in the first place.

---

## 📋 Pre-Implementation Checklist

### 1. Multi-Tenancy Validation ✅

**Question:** Does this feature access user data?

**If YES:**
- [ ] All Prisma queries MUST include `userId` filter
- [ ] Test: Can User A access User B's data? (MUST BE NO)
- [ ] Verified: All `findMany`, `findFirst`, `update`, `delete` have `where: { userId }`

**Example:**
```typescript
// ✅ CORRECT
async findAll(userId: number) {
  return this.prisma.exercise.findMany({
    where: { userId }  // MANDATORY
  });
}

// ❌ WRONG - Data leak!
async findAll() {
  return this.prisma.exercise.findMany();  // NO userId filter
}
```

**Test Command:**
```bash
# Run multi-tenancy tests
npm run test:e2e -- --grep "multi-tenancy"
```

---

### 2. Authentication Check ✅

**Question:** Should this endpoint require authentication?

**If YES:**
- [ ] `@UseGuards(JwtAuthGuard)` decorator present
- [ ] `@GetUser()` decorator to extract userId
- [ ] Test: Can unauthenticated user access? (MUST BE NO)

**Example:**
```typescript
// ✅ CORRECT
@UseGuards(JwtAuthGuard)
@Get()
findAll(@GetUser('id') userId: number) {
  return this.service.findAll(userId);
}

// ❌ WRONG - No authentication
@Get()
findAll() {  // Anyone can access!
  return this.service.findAll();
}
```

---

### 3. Data Isolation ✅

**Question:** Can users share data (e.g., public exercises)?

**If NO (default for GoBeyondFit):**
- [ ] All queries filter by `userId`
- [ ] No "public" flag without explicit approval
- [ ] Cross-user data access explicitly blocked

**If YES (rare, needs approval):**
- [ ] Security Agent approval documented
- [ ] `isPublic` field added to schema
- [ ] Query filters: `where: { OR: [{ userId }, { isPublic: true }] }`

---

### 4. SQL Injection Prevention ✅

**Question:** Does this feature use database queries?

**If YES:**
- [ ] Using Prisma ORM (NOT raw SQL)
- [ ] If raw SQL required: Parameterized queries ONLY
- [ ] NO string concatenation in queries

**Example:**
```typescript
// ✅ CORRECT (Prisma)
const exercises = await prisma.exercise.findMany({
  where: { name: { contains: searchTerm } }  // Safe
});

// ✅ CORRECT (Raw SQL with params)
const result = await prisma.$queryRaw`
  SELECT * FROM "Exercise" 
  WHERE "userId" = ${userId} AND "name" ILIKE ${`%${searchTerm}%`}
`;

// ❌ WRONG - SQL injection!
const result = await prisma.$queryRaw(
  `SELECT * FROM "Exercise" WHERE name = '${searchTerm}'`
);
```

---

### 5. Input Validation ✅

**Question:** Does this feature accept user input?

**If YES:**
- [ ] DTO class created with `class-validator` decorators
- [ ] All fields have validation rules
- [ ] Tested with invalid/malicious input

**Example:**
```typescript
// ✅ CORRECT
export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;
}

// ❌ WRONG - No validation
export class CreateExerciseDto {
  name: string;        // Any length, any content
  description: string; // Could be 10MB of text
  muscleGroup: any;    // Could be anything
}
```

---

### 6. Authorization Check ✅

**Question:** Can any authenticated user perform this action?

**If NO (role-based):**
- [ ] Role check implemented (`@Roles('COACH')`)
- [ ] Ownership check if modifying resources
- [ ] Test: Can non-owner modify? (MUST BE NO)

**Example:**
```typescript
// ✅ CORRECT - Role check
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COACH')
@Post()
createProgram() { ... }

// ✅ CORRECT - Ownership check
async updateExercise(exerciseId: string, userId: number, data: any) {
  const exercise = await this.prisma.exercise.findUnique({
    where: { id: exerciseId }
  });
  
  if (exercise.userId !== userId) {
    throw new ForbiddenException('Not your exercise');
  }
  
  return this.prisma.exercise.update({ ... });
}
```

---

### 7. Sensitive Data Protection ✅

**Question:** Does this feature handle sensitive data?

**If YES:**
- [ ] Passwords: Hashed with bcrypt (10+ rounds)
- [ ] Secrets: In `.env` file, NOT in code
- [ ] PII: Minimal logging, no console.log
- [ ] Tokens: JWT stored securely, short expiry

**Example:**
```typescript
// ✅ CORRECT - Hashed password
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ CORRECT - JWT secret from env
const token = this.jwtService.sign(payload, {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d'
});

// ❌ WRONG - Plaintext password
user.password = password;

// ❌ WRONG - Hardcoded secret
const token = jwt.sign(payload, 'my-secret-123');
```

---

### 8. Error Handling ✅

**Question:** Does this feature handle errors?

**If YES:**
- [ ] Try-catch blocks present
- [ ] Generic error messages (no stack traces to client)
- [ ] Detailed errors logged server-side only
- [ ] HTTP status codes appropriate

**Example:**
```typescript
// ✅ CORRECT
try {
  return await this.service.findOne(id, userId);
} catch (error) {
  this.logger.error('Failed to fetch exercise', error.stack);
  throw new InternalServerErrorException('Failed to fetch exercise');
}

// ❌ WRONG - Exposes internals
catch (error) {
  throw new Error(error.message);  // Could expose DB schema
}
```

---

## 🚨 Critical Security Rules

### NEVER COMMIT:
- [ ] ❌ `.env` files
- [ ] ❌ Hardcoded passwords, API keys, secrets
- [ ] ❌ Database connection strings
- [ ] ❌ JWT secrets in code

### ALWAYS:
- [ ] ✅ Filter by `userId` in all Prisma queries
- [ ] ✅ Use `@UseGuards(JwtAuthGuard)` for protected routes
- [ ] ✅ Validate all user input with DTOs
- [ ] ✅ Hash passwords with bcrypt
- [ ] ✅ Use environment variables for secrets

---

## 🧪 Security Testing

**Before committing, run:**

```bash
# 1. Security audit
npm audit --audit-level=moderate

# 2. Multi-tenancy tests
npm run test:e2e -- test/security-multi-tenancy.e2e-spec.ts

# 3. Pre-commit hook (automatic)
git commit  # Hook runs automatically
```

---

## 📞 Escalation

**If you're unsure about any security aspect:**

1. **Ask Security Agent:**
   ```
   @workspace #file:.copilot/agents/01-security-agent.md
   
   Is this implementation secure?
   [Paste your code]
   ```

2. **Create Security Review Issue:**
   - Label: `security-review-needed`
   - Assign: @01-security-agent
   - Wait for approval before merging

---

## 📊 Security Metrics

**Current Status:**
- ✅ Multi-tenancy: Enforced on all queries
- ✅ Authentication: JWT with 7-day expiry
- ✅ Password Hashing: bcrypt (10 rounds)
- ✅ Input Validation: class-validator on all DTOs
- ✅ Pre-commit Hook: Active

**Security Incidents:** 0 (since 2024-12-11)

---

## 🎓 Security Training Resources

**Required Reading:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Prisma Multi-Tenancy Guide](https://www.prisma.io/docs/guides/database/multi-tenancy)

**Internal Docs:**
- [SECURITY_AUDIT_REVIEW_QUEUE.md](./SECURITY_AUDIT_REVIEW_QUEUE.md)
- [MULTI_TENANCY.md](./MULTI_TENANCY.md)

---

**Version:** 1.0  
**Last Updated:** 2025-12-15  
**Maintained By:** Security Agent (01)  
**Enforcement:** Mandatory for all features
