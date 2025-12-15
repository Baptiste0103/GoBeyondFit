# Meilleures Pratiques de Prompting

## Table des Matières
1. [Le Framework CLEAR](#framework-clear)
2. [Prompts Efficaces vs Inefficaces](#prompts-efficaces-vs-inefficaces)
3. [Patterns de Prompts](#patterns-de-prompts)
4. [Anti-Patterns à Éviter](#anti-patterns)
5. [Techniques Avancées](#techniques-avancees)

---

## Framework CLEAR

### 🎯 Méthode CLEAR pour des Prompts Parfaits

**C - Context** (Contexte)  
**L - Location** (Emplacement)  
**E - Expectations** (Attentes)  
**A - Acceptance Criteria** (Critères d'Acceptation)  
**R - Restrictions** (Contraintes)

### Exemple d'Application

#### ❌ Sans CLEAR (Vague)
```
"Add validation to the user form"
```

#### ✅ Avec CLEAR (Précis)
```
**C - Context:**
I'm working on user registration in a fitness SaaS app

**L - Location:**
File: backend/src/auth/dto/register-user.dto.ts

**E - Expectations:**
Add Zod validation schema with:
- Email: valid email format, max 255 chars
- Password: min 8 chars, 1 uppercase, 1 number, 1 special char
- Name: 2-100 chars, only letters and spaces
- Phone: optional, E.164 format

**A - Acceptance Criteria:**
- All fields validated before hitting the database
- Clear error messages for each validation failure
- TypeScript types properly inferred from schema

**R - Restrictions:**
- Must use Zod (already in package.json)
- Follow existing DTO patterns in users module
- Don't modify the database schema
```

### Template CLEAR Réutilisable

```
Context: [Que faites-vous ? Quel est le but ?]
Location: #file:[chemin] ou [module/dossier]
Expectations: [Résultat souhaité en détails]
Acceptance Criteria: [Comment savoir que c'est bon ?]
Restrictions: [Technologies, patterns, contraintes]
```

---

## Prompts Efficaces vs Inefficaces

### 🔴 Prompts Inefficaces

#### 1. Trop Vague
```
❌ "Améliore ce code"
❌ "Répare le bug"
❌ "Fais quelque chose avec la base de données"
❌ "Rends-le meilleur"
```

**Problème :** Copilot doit deviner vos intentions.

#### 2. Sans Contexte
```
❌ "Crée une fonction de validation"
```
**Manque :** Validation de quoi ? Pour quel cas d'usage ? Quelles règles ?

#### 3. Trop Ambitieux
```
❌ "Construis un système d'authentification complet avec OAuth, 2FA, 
   reset de mot de passe, vérification email, rate limiting, Redis cache,
   et sessions distribuées"
```
**Problème :** Trop complexe d'un coup, résultat généralisé et superficiel.

---

### 🟢 Prompts Efficaces

#### 1. Spécifique et Détaillé
```
✅ "Refactor backend/src/programs/programs.service.ts to:
   1. Extract database queries into a repository pattern
   2. Add proper error handling with custom exceptions
   3. Implement caching with Redis (5 min TTL)
   4. Add logging with Winston (info, error levels)
   5. Maintain all existing functionality
   Include unit tests for the refactored code"
```

#### 2. Avec Contexte Riche
```
✅ "I'm building a workout tracking feature where users can:
   - Create custom workouts
   - Add exercises with sets, reps, weight
   - Track completion and progress
   
   Analyze #file:programs.service.ts for the pattern used,
   then implement workouts.service.ts following the same:
   - Dependency injection
   - Error handling
   - Prisma transactions
   - Return types
   Include comprehensive TypeScript types"
```

#### 3. Incrémental et Structuré
```
✅ Phase 1: "Design the database schema for Stripe subscription billing:
   - User has one subscription
   - Subscription has tier (free, pro, enterprise) and status
   - Payment history tracking
   - Webhook events log
   Show Prisma schema with relations"

   [Après validation]

✅ Phase 2: "Generate the Prisma migration for that schema"

✅ Phase 3: "Implement the subscription service with:
   - createSubscription(userId, tier)
   - updateSubscription(subscriptionId, newTier)
   - cancelSubscription(subscriptionId)
   - Handle Stripe webhook events
   Use dependency injection and error handling"
```

---

## Patterns de Prompts

### Pattern 1 : Feature Complete

**Structure :**
```
Implement [feature] with complete implementation:

**Backend:**
- Prisma schema changes
- Migration
- Service layer with business logic
- Controller with endpoints
- DTOs with validation
- Error handling

**Tests:**
- Unit tests for service
- Integration tests for controller
- Edge cases

**Documentation:**
- API documentation
- Inline comments

**Constraints:**
[Libraries, patterns, etc.]
```

**Exemple Concret :**
```
Implement user notifications system:

Backend:
- Add Notification model to schema.prisma:
  * id, userId, title, message, type, isRead, createdAt
- Create notifications.module.ts in backend/src
- NotificationsService with:
  * create(userId, notification)
  * markAsRead(notificationId)
  * getUserNotifications(userId, pagination)
  * deleteNotification(notificationId)
- NotificationsController with REST endpoints
- Use Zod for DTO validation
- Real-time updates with WebSocket (Socket.io)

Tests:
- Mock Prisma client
- Test all CRUD operations
- Test pagination
- Test WebSocket events

Follow patterns from existing modules (users, programs)
```

---

### Pattern 2 : Debug Complet

**Structure :**
```
I'm experiencing [problem]:

**Error:**
[Stack trace complet]

**Context:**
- File: #file:[path]
- What I'm trying to do: [action]
- Expected behavior: [result attendu]
- Actual behavior: [ce qui se passe]

**Environment:**
[Versions, config pertinente]

Please:
1. Identify the root cause
2. Explain why it's happening
3. Provide the fix with explanation
4. Suggest how to prevent similar issues
```

**Exemple Concret :**
```
I'm getting a 500 error when creating a workout:

Error:
PrismaClientKnownRequestError: 
Foreign key constraint failed on the field: `programId`
    at programs.controller.ts:67

Context:
- File: #file:backend/src/programs/programs.controller.ts
- Trying to: Create a new workout for a program
- Expected: Workout created with 201 status
- Actual: 500 error, no workout created
- Request: POST /programs/123/workouts
  Body: { name: "Chest Day", exercises: [...] }

Environment:
- NestJS 10.2.0
- Prisma 5.7.1
- PostgreSQL 15

The program with id 123 exists in the database.

Please:
1. Why is the foreign key constraint failing?
2. What's wrong with my controller logic?
3. Fix the issue
4. Add validation to prevent this
```

---

### Pattern 3 : Code Review

**Structure :**
```
Review [file/module] for:

**Code Quality:**
- Code smells
- Complexity (cyclomatic > 10)
- Duplication
- Naming conventions

**Performance:**
- N+1 queries
- Missing indexes
- Inefficient algorithms
- Memory leaks

**Security:**
- Input validation
- SQL injection
- XSS vulnerabilities
- Authentication/authorization

**Best Practices:**
- SOLID principles
- Error handling
- Logging
- Comments/documentation

For each issue found, provide:
- Severity (Critical/High/Medium/Low)
- File and line number
- Explanation
- Recommended fix
```

**Exemple Concret :**
```
Review backend/src/auth for production readiness:

Code Quality:
- Functions > 50 lines
- Duplicated logic
- Poor variable names
- Missing TypeScript types

Performance:
- Database query optimization
- Unnecessary computations
- Caching opportunities

Security:
- JWT token handling
- Password hashing (bcrypt settings)
- Rate limiting implementation
- Session management
- Input validation completeness

Best Practices:
- Error handling patterns
- Logging (sensitive data exposure?)
- Dependency injection
- Unit test coverage

Prioritize by: Critical (blocking) > High (important) > Medium > Low

For top 5 issues, provide complete fix with code
```

---

### Pattern 4 : Architecture Planning

**Structure :**
```
I need to design [system/feature]:

**Requirements:**
[Functional requirements]

**Constraints:**
[Technical, business, etc.]

**Questions:**
1. What's the best architecture approach?
2. What are the trade-offs?
3. How does it scale?
4. What are potential issues?

Please provide:
- Architecture diagram (text/ASCII)
- Database schema
- API endpoints
- File structure
- Technology recommendations
- Implementation plan with steps
- Testing strategy
```

**Exemple Concret :**
```
Design a multi-tenant architecture for the fitness SaaS:

Requirements:
- Support 1000+ organizations (gyms/trainers)
- Each org has isolated data (users, programs, workouts)
- Some shared data (exercise library)
- Org admins can manage their users
- Billing per organization
- Need to support both: shared DB and separate DB per enterprise client

Constraints:
- Current stack: NestJS, Prisma, PostgreSQL
- Must maintain existing single-tenant code
- Migration path for current users
- Performance: <200ms API response time
- Budget: optimize for cost at scale

Please provide:
1. Tenant isolation strategy (schema vs database)
2. Database schema design with tenant_id
3. Middleware for tenant context
4. Migration strategy from single to multi-tenant
5. Pricing tier implications (shared vs dedicated DB)
6. Security considerations
7. Step-by-step implementation plan
8. Testing approach for data isolation

Include code examples for key components
```

---

### Pattern 5 : Optimization

**Structure :**
```
Optimize [component] for [metric]:

**Current State:**
- Performance metrics: [current numbers]
- Bottlenecks identified: [if known]

**Target:**
- Goal: [specific metric]
- Constraints: [what can't change]

**Analysis Needed:**
1. Profile and identify bottlenecks
2. Suggest optimizations with impact estimates
3. Prioritize by ROI (effort vs impact)
4. Implement top 3 optimizations
5. Add monitoring to track improvement
```

**Exemple Concret :**
```
Optimize workout listing endpoint for performance:

Current State:
- Endpoint: GET /programs/:id/workouts
- Response time: 2.5s average (p95: 3.8s)
- Database: PostgreSQL with 50k workouts, 500k exercises
- Current code: #file:backend/src/workouts/workouts.service.ts

Target:
- Goal: <200ms average, <500ms p95
- Can't: Change API contract (breaking change)
- Can: Modify queries, add caching, add indexes

Analysis:
1. Run EXPLAIN ANALYZE on current queries
2. Identify N+1 query issues
3. Check for missing indexes
4. Evaluate caching strategy
5. Consider pagination improvements

Provide:
- Specific query optimizations with before/after
- Index recommendations (with migration)
- Caching strategy (Redis, TTL, invalidation)
- Prisma query improvements (include, select)
- Load testing approach to verify
- Monitoring queries to track performance
```

---

## Anti-Patterns à Éviter

### ❌ Anti-Pattern 1 : "Do Everything"

**Problème :**
```
❌ "Build me a complete authentication system with OAuth, 2FA, 
   password reset, email verification, rate limiting, Redis caching,
   session management, JWT refresh tokens, and social login"
```

**Pourquoi c'est mauvais :**
- Trop complexe d'un coup
- Résultat superficiel
- Manque de contexte spécifique
- Difficile à tester
- Pas adapté à votre projet

**✅ Solution :**
Décomposez en phases :
```
Phase 1: "Design authentication architecture for my SaaS:
- JWT access + refresh tokens
- PostgreSQL for user storage
- bcrypt for passwords
- Email verification flow
- Password reset flow
Show: database schema, endpoints, security considerations"

[Review and validate]

Phase 2: "Implement Phase 1 - basic JWT authentication:
- User model in Prisma
- Registration endpoint with bcrypt
- Login endpoint returning JWT
- Auth guard for protected routes
Following NestJS best practices"

[Test and validate]

Phase 3: "Add refresh token support to existing auth..."

etc.
```

---

### ❌ Anti-Pattern 2 : "No Constraints"

**Problème :**
```
❌ "Add caching to improve performance"
```

**Pourquoi c'est mauvais :**
- Manque de spécificité
- Copilot doit deviner la technologie
- Peut suggérer quelque chose d'incompatible
- Pas de critères de succès

**✅ Solution :**
Soyez ultra-spécifique :
```
✅ "Add Redis caching to workout queries in workouts.service.ts:

Technology:
- Use ioredis (already in package.json)
- Inject via NestJS dependency injection

Strategy:
- Cache key format: 'workout:{userId}:{programId}'
- TTL: 5 minutes
- Cache on: getWorkoutsByProgram()
- Invalidate on: create, update, delete operations
- Fallback to DB if Redis unavailable

Error Handling:
- Log Redis errors but don't fail requests
- Implement circuit breaker pattern

Metrics:
- Track cache hit/miss rate
- Monitor Redis connection health

Include:
- Redis module setup
- Service modifications
- Cache invalidation logic
- Unit tests with mocked Redis"
```

---

### ❌ Anti-Pattern 3 : "Assuming Context"

**Problème :**
```
❌ "Fix the bug"
```

**Pourquoi c'est mauvais :**
- Quel bug ?
- Où ?
- Quel comportement attendu ?

**✅ Solution :**
Contexte complet :
```
✅ "Fix bug in workout creation:

Bug Location: #file:programs.controller.ts:67
Error: TypeError: Cannot read property 'id' of undefined

Reproduction:
1. POST /programs/123/workouts
2. Body: { name: "Test", exercises: [...] }
3. User is authenticated (JWT valid)
4. Program 123 exists and belongs to user

Expected: 201 Created with workout object
Actual: 500 Server Error

Stack Trace:
[paste complete trace]

Relevant Code: #file:programs.controller.ts:45-80

Debug info:
- console.log(user) shows: undefined
- req.user is not set despite passing AuthGuard
- Other endpoints work fine with same guard

Fix the issue and explain what was wrong"
```

---

### ❌ Anti-Pattern 4 : "Vague Improvement"

**Problème :**
```
❌ "Make this code better"
```

**Pourquoi c'est mauvais :**
- "Better" selon quels critères ?
- Performance ? Lisibilité ? Sécurité ?
- Trop subjectif

**✅ Solution :**
Critères mesurables :
```
✅ "Refactor #file:programs.service.ts:createProgram function:

Current Issues:
- Cyclomatic complexity: 15 (target: <10)
- Function length: 120 lines (target: <50)
- No error handling for Prisma failures
- Missing input validation
- Difficult to unit test (tightly coupled)

Improvements Needed:
1. Extract helper functions:
   - validateProgramData()
   - createExercisesFromTemplate()
   - notifyUserOfCreation()
2. Add comprehensive error handling:
   - Prisma errors → user-friendly messages
   - Validation errors → 400 with details
   - Unexpected errors → 500 with logging
3. Add JSDoc comments
4. Make testable with dependency injection
5. Add input validation with Zod

Constraints:
- Maintain existing API contract
- Don't break existing tests
- Follow patterns from users.service.ts

Show before/after metrics:
- Complexity score
- Line count
- Number of extracted functions"
```

---

### ❌ Anti-Pattern 5 : "Tutorial Request"

**Problème :**
```
❌ "Teach me how WebSockets work"
```

**Pourquoi c'est mauvais :**
- Copilot est pour coder, pas tutoriels généraux
- Mieux utiliser docs officielles
- Pas spécifique à votre projet

**✅ Solution :**
Contextualiser à votre projet :
```
✅ "Implement real-time notifications using WebSockets:

Current Setup:
- NestJS backend
- React frontend
- Want users to receive instant notifications

Requirements:
1. Backend (NestJS):
   - Set up Socket.io gateway
   - Authenticate connections (JWT)
   - Emit events: 'notification', 'workout-completed'
   - Handle client subscriptions to specific channels

2. Frontend (React):
   - Connect to WebSocket on login
   - Listen for notification events
   - Display toast when received
   - Reconnect on disconnect

3. Integration:
   - Emit from NotificationsService when creating notification
   - Send only to specific user (not broadcast)

Provide:
- Gateway implementation (backend)
- React hook for WebSocket connection
- Type-safe event payloads (TypeScript)
- Error handling and reconnection logic
- Testing strategy

Follow NestJS WebSocket patterns"
```

---

## Techniques Avancées

### Technique 1 : Chain-of-Thought Prompting

**Concept :** Demander à Copilot de "réfléchir" avant d'implémenter.

**Pattern :**
```
Before implementing [feature], analyze:

1. **Architecture Decision:**
   - What are the options?
   - Pros/cons of each?
   - Which is best for my use case and why?

2. **Edge Cases:**
   - What could go wrong?
   - How to handle errors?
   - What about race conditions?

3. **Testing Strategy:**
   - What needs to be tested?
   - How to mock dependencies?
   - Integration vs unit tests?

4. **Performance Implications:**
   - Will this scale?
   - Any bottlenecks?
   - Caching needs?

Only after analyzing, show me the implementation
```

**Exemple :**
```
I need to implement subscription billing with Stripe.
Before writing code, think through:

1. Architecture:
   - Webhook vs polling for payment status?
   - Where to store subscription data?
   - How to handle failed payments?
   
2. Edge Cases:
   - User cancels mid-month → prorated refund?
   - Payment method expires → how to notify?
   - Webhook arrives out of order → idempotency?
   - User upgrades/downgrades → immediate or next cycle?

3. Testing:
   - How to test webhooks locally?
   - Mock Stripe API or use test mode?
   - What scenarios to cover?

4. Security:
   - Webhook signature verification?
   - Prevent replay attacks?
   - Secure storage of Stripe customer ID?

After analysis, show implementation with your recommendations
```

---

### Technique 2 : Iterative Refinement

**Pattern :** Améliorer progressivement par itérations.

**Workflow :**
```
Iteration 1: "Implement basic [feature]"
[Get initial code]

Iteration 2: "Review this implementation for [specific aspect]"
[Get feedback]

Iteration 3: "Apply those improvements"
[Get improved code]

Iteration 4: "Now optimize for [metric]"
[Get optimized code]

Iteration 5: "Generate comprehensive tests"
[Get tests]

Iteration 6: "Add documentation"
[Get docs]
```

**Exemple Concret :**
```
Iteration 1:
"Implement user registration endpoint in auth.controller.ts:
- Accept email, password, name
- Hash password with bcrypt
- Save to database
- Return JWT token"

[Code généré]

Iteration 2:
"Review this registration code for security issues"

[Feedback reçu: password not validated, no rate limiting, email not verified, etc.]

Iteration 3:
"Apply security improvements:
- Zod validation (strong password)
- Rate limit with @nestjs/throttler
- Email verification flow
- Check for existing email"

[Code amélioré]

Iteration 4:
"Optimize this for performance - reduce database calls"

[Code optimisé avec batching]

Iteration 5:
"Generate unit and integration tests covering:
- Happy path
- Duplicate email
- Weak password
- Rate limit exceeded
- Email verification flow"

[Tests complets]

Iteration 6:
"/doc API documentation with request/response examples"

[Documentation ajoutée]
```

---

### Technique 3 : Constraint-Based Development

**Pattern :** Imposer des contraintes strictes pour forcer la qualité.

**Structure :**
```
Implement [feature] with STRICT requirements:

**MUST:**
- [Requirement absolu 1]
- [Requirement absolu 2]

**MUST NOT:**
- [Interdit 1]
- [Interdit 2]

**REJECTION CRITERIA:**
Reject any implementation that violates these constraints

**VALIDATION:**
Show how the implementation meets each requirement
```

**Exemple :**
```
Implement workout creation endpoint with STRICT requirements:

MUST:
- Use Prisma transactions for atomicity
- Validate input with Zod (not class-validator)
- Return HTTP 201 on success (not 200)
- Include Location header with new resource URL
- Log to Winston with structured JSON format
- Handle Prisma unique constraint violations with 409 Conflict
- Implement optimistic locking for concurrent updates
- Add Swagger/OpenAPI documentation decorators

MUST NOT:
- Use try-catch without proper error classification
- Return stack traces to client
- Log sensitive user data
- Use SELECT * queries
- Have functions >50 lines

REJECTION CRITERIA:
Reject implementation if:
- Missing transaction wrapping
- No input validation
- Wrong HTTP status codes
- Missing error handling
- No tests included

VALIDATION:
For each MUST requirement, show where it's implemented in the code
```

---

### Technique 4 : Template-Driven Generation

**Pattern :** Extraire des patterns, créer des templates, générer du code cohérent.

**Workflow :**
```
Session 1: "Analyze #file:users.controller.ts, #file:programs.controller.ts
Extract common patterns:
- Structure
- Error handling
- Validation approach
- Response format
- Swagger documentation
- Logging

Create a documented template"

[Template créé]

Session 2: "Using that template, create workouts.controller.ts with:
- CRUD endpoints
- Pagination
- Filtering by program
- Swagger docs
- Same patterns as template"

[Code généré cohérent]
```

---

### Technique 5 : Documentation-Driven Development

**Pattern :** Écrire la doc d'abord, puis implémenter.

**Workflow :**
```
Step 1: "/doc Generate OpenAPI 3.0 specification for user subscription feature:

Endpoints:
POST /subscriptions - Create subscription
GET /subscriptions/:id - Get subscription
PATCH /subscriptions/:id - Update tier
DELETE /subscriptions/:id - Cancel

Include:
- Request/response schemas
- Error responses
- Authentication requirements
- Rate limits
- Examples"

[Spec généré]

Step 2: [Review and validate the API design]

Step 3: "Implement the API exactly as documented in the OpenAPI spec above:
- Controllers with decorators
- DTOs matching schemas
- Services with business logic
- Error handling as specified
- Include unit tests"

[Implementation matching spec]
```

---

### Technique 6 : Rubber Duck Debugging with AI

**Pattern :** Expliquer le problème étape par étape, Copilot pose des questions.

**Structure :**
```
I'm going to explain my bug step-by-step.
After each step, ask me a clarifying question.

Bug: [Description]
[Attendre question]
[Répondre]
[Continuer jusqu'à solution]
```

**Exemple :**
```
I'll explain my bug step-by-step. Ask questions after each step.

Bug: Users can't create workouts after upgrading to premium tier.

[Copilot: "What error message or behavior do they see?"]

They get 403 Forbidden status

[Copilot: "Where is the authorization check happening? Can you show the code?"]

In auth.guard.ts, checking if user.subscriptionTier === 'premium'
#file:auth/auth.guard.ts:25-40

[Copilot: "What is the value of user.subscriptionTier when this fails?"]

[Check logs] It's 'pro' not 'premium'

[Copilot: "Ah! The tier name mismatch. How did the user upgrade? Show me the upgrade code."]

#file:subscriptions.service.ts:updateTier()
[Check code] Oh! The service updates 'tier' but the guard checks 'subscriptionTier'!

[Copilot: "Exactly! The database column and guard are checking different fields..."]

[Solution discovered through dialogue]
```

---

## Formules de Prompts Gagnantes

### Formule 1 : "Context + Action + Constraints"
```
[Context about current state]
[Action to perform]
[Constraints and requirements]
```

### Formule 2 : "Problem + Goal + Solution Criteria"
```
Problem: [What's wrong]
Goal: [What success looks like]
Criteria: [How to measure success]
```

### Formule 3 : "Analyze + Decide + Implement"
```
Analyze: [What to examine]
Decide: [What decisions need to be made]
Implement: [What to build based on analysis]
```

### Formule 4 : "Current + Target + Path"
```
Current State: [Where we are]
Target State: [Where we want to be]
Path: [How to get there, step by step]
```

---

## Checklist de Prompt Qualité

Avant d'envoyer un prompt, vérifiez :

- [ ] **Spécifique** : Pas de termes vagues comme "améliorer", "corriger"
- [ ] **Contexte** : Inclut fichiers (#file:), workspace (@workspace), ou sélection
- [ ] **Mesurable** : Critères de succès clairs
- [ ] **Contraintes** : Technologies, patterns, limites mentionnées
- [ ] **Actionnable** : Copilot sait exactement quoi faire
- [ ] **Complet** : Toutes les infos nécessaires fournies
- [ ] **Structuré** : Facile à lire et comprendre
- [ ] **Réaliste** : Pas trop ambitieux pour un seul prompt

---

## Prochaines Étapes

Vous maîtrisez maintenant l'art du prompting ! Appliquez ces techniques avec :

- [04_Workflows.md](04_Workflows.md) - Workflows de productivité quotidiens
- [09_Prompt_Library.md](09_Prompt_Library.md) - 50+ prompts prêts à utiliser

---

*Dernière mise à jour : Décembre 2025*
