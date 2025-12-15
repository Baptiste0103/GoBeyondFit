# Techniques Avancées Copilot

## Table des Matières
1. [Chain-of-Thought Prompting](#chain-of-thought-prompting)
2. [Context Engineering](#context-engineering)
3. [Code Generation Patterns](#code-generation-patterns)
4. [AI-Assisted Architecture](#ai-assisted-architecture)
5. [Meta-Programming](#meta-programming)

---

## Chain-of-Thought Prompting

### Concept
Demander à Copilot de "penser à voix haute" avant d'implémenter pour obtenir des solutions plus réfléchies.

### Pattern de Base

```
"Before implementing [task], think through:

1. **Options Analysis:**
   What are the different approaches?
   Pros and cons of each?
   
2. **Decision Making:**
   Which approach is best for this context and why?
   
3. **Implementation Plan:**
   Step-by-step breakdown
   
4. **Risk Assessment:**
   What could go wrong?
   How to mitigate?

Then implement based on your analysis"
```

---

### Exemple Complexe: Architecture Decision

```
"I need to implement real-time collaboration for workout programs 
(multiple trainers editing same program simultaneously).

Before suggesting implementation, analyze:

**1. Technical Approaches:**
a) WebSockets with Operational Transformation (OT)
b) WebSockets with CRDT (Conflict-free Replicated Data Types)
c) WebRTC with P2P sync
d) Polling with optimistic locking
e) Firebase/Supabase realtime

For each:
- Complexity to implement
- Scalability characteristics
- Consistency guarantees
- Infrastructure requirements
- Cost implications
- Learning curve

**2. Constraints Analysis:**
- Current stack: NestJS, PostgreSQL, React
- Expected concurrent users: 5-10 per program max
- Consistency requirement: Eventual vs Strong
- Budget: Startup (optimize for cost)
- Team size: 2 developers
- Timeline: 2-3 weeks

**3. Edge Cases:**
- Two users delete same exercise simultaneously
- Network partition
- User goes offline mid-edit
- Conflict resolution UI
- Data loss prevention

**4. Testing Strategy:**
- How to test concurrent edits?
- Simulation approach
- Edge case coverage

**5. Rollback Plan:**
- Can we launch without this feature?
- Phased rollout strategy?

After complete analysis, recommend best approach with:
- Justification
- High-level implementation plan
- Code structure
- Key challenges and solutions"
```

**Résultat Attendu:**
- Analyse approfondie de toutes les options
- Recommandation justifiée
- Plan d'implémentation détaillé
- Meilleure décision qu'un implementation directe

---

### Chain-of-Thought pour Debugging

```
"I have a complex bug. Let's debug systematically:

**Bug:** [Description]

**Step 1 - Hypothesis Generation:**
Generate 5 possible root causes ranked by likelihood

**Step 2 - Hypothesis Validation:**
For top 3 hypotheses, suggest how to test each

**Step 3 - Investigation:**
Guide me through investigating hypothesis #1:
- What to check
- Where to look
- What to log
- Expected vs actual results

**Step 4 - Root Cause:**
Based on findings, identify root cause with explanation

**Step 5 - Fix Strategy:**
Multiple fix approaches with trade-offs

**Step 6 - Prevention:**
How to prevent similar bugs in future"
```

---

## Context Engineering

### Optimisation du Contexte pour Performance et Précision

#### Technique 1: Contexte Ciblé

**❌ Contexte Trop Large (Lent):**
```
"@workspace help me implement authentication"
```

**✅ Contexte Optimal (Rapide et Précis):**
```
"Using #file:users/users.service.ts as reference for patterns,
implement authentication in #file:auth/auth.service.ts with:
[specific requirements]

Context notes:
- We use Prisma (config in #file:prisma/schema.prisma)
- DTOs use Zod validation (#file:users/dto/create-user.dto.ts)
- Error handling follows #file:common/filters/http-exception.filter.ts"
```

---

#### Technique 2: Contexte Hiérarchique

**Pattern: Top-Down Context Building**

```
Level 1 - Architecture Overview:
"@workspace explain the high-level architecture of this fitness app"

[Understand structure]

Level 2 - Module Deep Dive:
"Focus on auth module only. Explain authentication flow in detail"

[Understand auth]

Level 3 - Specific Implementation:
"In #file:auth/auth.service.ts:login, I need to add 2FA.
Show implementation matching existing patterns"

[Targeted implementation]
```

**Avantage:** Chaque niveau build sur le précédent, meilleure compréhension.

---

#### Technique 3: Context Caching

**Réutiliser le Contexte Établi:**

```
Session Start:
"I'll be working on the workout management module today.
Key files:
- #file:workouts/workouts.service.ts
- #file:workouts/workouts.controller.ts
- #file:prisma/schema.prisma (Workout model)
- #file:programs/programs.service.ts (for patterns)

Acknowledge you understand this context"

[Copilot confirms]

Then, through the session:
"Add exercise reordering feature" (context already loaded)
"Now add workout duplication" (context maintained)
"Optimize query performance" (context maintained)
```

**Avantage:** Context chargé une fois, réutilisé pour multiple requests.

---

#### Technique 4: Exclusion de Contexte

**Dire à Copilot Quoi Ignorer:**

```
"Implement notification system

IGNORE:
- Test files (focus on implementation)
- Frontend (backend only)
- Old deprecated auth module (use new one)
- Config files (don't modify)

FOCUS ON:
- backend/src/notifications only
- Follow patterns from #file:users/users.service.ts
- Use existing Prisma connection
- Match error handling from #file:auth/auth.controller.ts"
```

---

### Context Window Management

#### Stratégie: Sliding Window Context

```
Phase 1 (Database):
"Let's design the schema for feature X"
[Generate schema]

/clear (free up context)

Phase 2 (Backend):
"Implement backend for feature X with this schema: [paste schema]"
[Implement backend]

/clear

Phase 3 (Frontend):
"Implement frontend for feature X calling these endpoints: [paste API docs]"
[Implement frontend]
```

**Quand Utiliser:**
- Projets très larges
- Feature spanning multiple domains
- Context devient confus

---

## Code Generation Patterns

### Pattern 1: Template Extraction → Replication

**Workflow:**

```
Step 1 - Extract Template:
"Analyze these files and extract the common pattern:
- #file:users/users.module.ts
- #file:users/users.controller.ts
- #file:users/users.service.ts
- #file:users/dto/create-user.dto.ts

Document the pattern as a template with [PLACEHOLDERS] for:
- Entity name
- Fields
- Relationships
- Custom logic"

[Template documented]

Step 2 - Validate Template:
"Review the template for completeness and accuracy"

[Template refined]

Step 3 - Generate from Template:
"Using the template, generate complete 'Subscriptions' module with:
Entity: Subscription
Fields: userId, tier, status, startDate, endDate
Relationships: belongs to User
Custom logic: 
  - Cannot downgrade if active
  - Sends notification on status change"

[Code generated matching exact patterns]
```

---

### Pattern 2: Incremental Code Growth

**Pattern: Start Small, Grow Gradually**

```
Iteration 1 - Minimal:
"Create minimal Subscription model in Prisma with just:
- id, userId, tier"

[Basic model]

Iteration 2 - Add Fields:
"Add status (enum: active, cancelled, expired), 
startDate, endDate, cancelledAt"

[Fields added]

Iteration 3 - Add Relations:
"Add relation to User model, ensure cascade delete"

[Relations configured]

Iteration 4 - Add Validation:
"Add Prisma-level validation:
- endDate must be after startDate
- tier from specific enum values"

[Constraints added]

Iteration 5 - Add Indexes:
"Optimize with indexes on userId and status"

[Indexes added]
```

**Avantage:**
- Chaque étape testable
- Meilleur contrôle
- Erreurs détectées tôt

---

### Pattern 3: Test-Driven Code Generation

```
Phase 1 - Test Scenarios:
"Generate test scenarios for user subscription upgrade:
1. Happy path: Free → Pro
2. Edge case: Already Pro
3. Edge case: Invalid tier
4. Edge case: Payment fails
5. Error case: User not found
6. Edge case: Mid-month upgrade (prorating)

For each, specify:
- Input
- Expected output
- Expected side effects"

[Scenarios documented]

Phase 2 - Generate Tests:
"/tests generate Jest tests for these scenarios
Mock: Prisma, Stripe, EmailService"

[Failing tests]

Phase 3 - Implement to Pass Tests:
"Implement SubscriptionService.upgrade() to pass all tests"

[Implementation]

Phase 4 - Verify:
"Run tests and fix any failures"
```

---

### Pattern 4: Constraint-Based Generation

**Force High Quality Through Strict Constraints:**

```
"Generate user authentication service with MANDATORY constraints:

**Architecture Constraints:**
- MUST use dependency injection (no direct imports of Prisma)
- MUST implement IAuthService interface
- MUST separate concerns (auth, user, token in different services)

**Security Constraints:**
- MUST hash passwords with bcrypt, 12 rounds
- MUST validate JWT signature
- MUST use refresh token rotation
- MUST implement rate limiting (5 attempts per 15 min)
- MUST log all authentication attempts

**Error Handling Constraints:**
- MUST use custom exception classes (not generic Error)
- MUST never expose password in logs or responses
- MUST return same error for invalid user or password (timing attack protection)

**Testing Constraints:**
- MUST be unit testable with mocked dependencies
- MUST not touch database in unit tests

**Code Quality Constraints:**
- Functions MUST be <50 lines
- Complexity MUST be <10
- MUST have JSDoc for public methods
- MUST have TypeScript strict mode compatible

**REJECTION CRITERIA:**
If implementation violates ANY constraint, explain why and regenerate.

**VALIDATION:**
After generation, verify each constraint is met with specific code references."
```

---

## AI-Assisted Architecture

### Architectural Decision Records (ADRs) with AI

```
"Create an Architectural Decision Record for [decision]:

**Context:**
[Situation and problem]

**Decision:**
[What we're deciding]

**Options Considered:**
Generate 4-5 options with:
- Description
- Pros (specific to our context)
- Cons (specific to our context)
- Cost (time, money, complexity)
- Risks

**Decision:**
Recommend best option with:
- Justification
- Why others rejected
- Trade-offs accepted

**Consequences:**
- Positive consequences
- Negative consequences
- Mitigation strategies

**Implementation Notes:**
- High-level approach
- Key challenges
- Success metrics"
```

---

### System Design with AI

```
"Design a scalable architecture for [system]:

**Requirements:**
[Functional and non-functional]

**Design Process:**

1. **Component Identification:**
   What are the main components?
   What does each do?

2. **Communication Patterns:**
   How do components interact?
   Sync or async?
   API design?

3. **Data Storage:**
   What data stores are needed?
   Why each type?
   Data models?

4. **Scalability Strategy:**
   What are bottlenecks?
   How to scale each component?
   Caching strategy?

5. **Reliability:**
   What can fail?
   How to handle failures?
   Retry/circuit breaker strategy?

6. **Security:**
   What needs protection?
   Authentication/authorization strategy?
   Data encryption?

7. **Monitoring:**
   What to monitor?
   Alerting strategy?

**Deliverables:**
- Architecture diagram (text/ASCII)
- Component descriptions
- API contracts
- Database schemas
- Deployment architecture
- Technology stack justification
- Implementation roadmap"
```

---

### Refactoring Strategy with AI

```
"Create comprehensive refactoring plan for [module]:

**Phase 1 - Analysis:**
1. Current architecture diagram
2. Code metrics (complexity, duplication, etc.)
3. Pain points identification
4. Technical debt quantification

**Phase 2 - Vision:**
1. Target architecture
2. Improvements expected (quantify)
3. Trade-offs accepted

**Phase 3 - Strategy:**
1. Big refactor vs incremental?
2. If incremental:
   - Strangler fig pattern?
   - Feature flags?
   - Parallel implementation?
3. Risk mitigation

**Phase 4 - Execution Plan:**
Step-by-step plan where:
- Each step is independently deployable
- Tests pass after each step
- No big bang changes
- Rollback possible at each step

**Phase 5 - Validation:**
How to measure success?
Metrics to track?
Definition of done?

Provide detailed plan ready to execute"
```

---

## Meta-Programming

### Generate Code Generators

```
"Create a code generator script that generates NestJS CRUD modules:

**Generator Requirements:**
- Input: Entity name, fields, relationships
- Output: Complete module with all files
- Follow our project patterns exactly

**What to Generate:**
1. Prisma model with:
   - Proper types
   - Relations
   - Indexes
   
2. Module file with:
   - Imports
   - Controllers
   - Providers
   
3. Controller with:
   - CRUD endpoints
   - Swagger decorators
   - Auth guards
   - Validation
   
4. Service with:
   - Dependency injection
   - CRUD methods
   - Error handling
   - Logging
   
5. DTOs with:
   - Zod validation
   - TypeScript types
   - Transform decorators
   
6. Unit tests with:
   - Mocked dependencies
   - All methods tested
   - Edge cases

**Usage:**
```bash
node generate-module.js Subscription userId:string tier:enum status:enum
```

Provide complete generator script"
```

---

### Pattern Mining

```
"Analyze my codebase and extract reusable patterns:

**Patterns to Extract:**
1. **Repository Pattern:**
   How do we interact with Prisma?
   Extract as reusable base class

2. **Error Handling Pattern:**
   How do we handle errors?
   Extract as decorator or utility

3. **Validation Pattern:**
   How do we validate input?
   Extract as reusable schemas

4. **Response Pattern:**
   How do we format responses?
   Extract as interceptor

5. **Logging Pattern:**
   How do we log?
   Extract as utility

**For each pattern:**
- Extract the pattern
- Create reusable abstraction
- Show how to apply to new code
- Refactor 2-3 existing files to use it

Goal: Reduce code duplication and enforce consistency"
```

---

### Macro Prompts (Prompt Composition)

**Create Super-Prompts from Sub-Prompts:**

```
"I'll give you a macro prompt. Break it into sub-prompts, 
execute each, then combine results:

**MACRO: Implement Feature X**

Sub-prompts:
1. Design database schema for X
2. Generate migration
3. Create service layer
4. Create controller
5. Create DTOs
6. Generate tests
7. Generate documentation

Execute each sub-prompt in order, 
passing results from previous steps as context.
Show me the complete implementation."
```

---

## Advanced Workflow Patterns

### Pattern: Spec-Driven Development

```
Step 1: "Generate comprehensive specification for [feature]:
- User stories
- Acceptance criteria
- API contract (OpenAPI)
- Database schema
- UI mockup descriptions
- Test scenarios
- Non-functional requirements

Format as detailed specification document"

[Spec generated]

Step 2: "Review spec with me" 
[Iterate until perfect]

Step 3: "Implement backend exactly per spec"

Step 4: "Implement frontend exactly per spec"

Step 5: "Generate tests covering all acceptance criteria"

Step 6: "Verify implementation matches spec 100%"
```

---

### Pattern: Rubber Duck Architecture

```
"I'll describe my architecture. You challenge every decision:

My Architecture:
[Description]

Your role:
For each component and decision, ask:
- Why this choice?
- What alternatives exist?
- What happens at scale?
- What if X fails?
- How to test?
- Cost implications?

Be skeptical and help me think deeper"
```

---

### Pattern: Pair Programming Mode

```
"Let's pair program on [task].

You are the navigator, I'm the driver.

Your job:
1. Suggest next steps
2. Ask clarifying questions
3. Point out potential issues
4. Suggest optimizations
5. Keep track of TODOs

My job:
- Write the code
- Make final decisions
- Answer your questions

Let's start. What should be our first step?"
```

---

### Pattern: Code Review Bot

```
"Act as a senior developer reviewing my PR:

PR Changes: [files/diffs]

Review for:
1. **Correctness:**
   - Logic bugs?
   - Edge cases handled?
   - Error scenarios covered?

2. **Code Quality:**
   - Readable?
   - Maintainable?
   - Follows patterns?
   - Too complex?

3. **Performance:**
   - Efficient algorithms?
   - Database queries optimized?
   - N+1 queries?

4. **Security:**
   - Input validated?
   - Auth checked?
   - Sensitive data protected?

5. **Testing:**
   - Tests adequate?
   - Edge cases tested?
   - Mocks appropriate?

6. **Documentation:**
   - Public APIs documented?
   - Complex logic explained?

Provide:
- Inline comments on specific lines
- Overall assessment
- Required changes vs suggestions
- Approval or request changes"
```

---

## Power User Techniques

### Technique: Context Switching

```
Working on Multiple Features:

[Feature A work]
"Create context snapshot for Feature A:
- What we've done
- What's left
- Key decisions
- Files modified"

[Switch to Feature B]

[Later, back to Feature A]
"Restore Feature A context: [paste snapshot]
Continue where we left off"
```

---

### Technique: Progressive Enhancement

```
Phase 1 - Basic:
"Implement [feature] with basic functionality only"
[Works, tested]

Phase 2 - Polish:
"Enhance with better error handling"
[Improved]

Phase 3 - Optimize:
"Optimize for performance"
[Faster]

Phase 4 - Production:
"Add logging, monitoring, documentation"
[Production-ready]
```

---

### Technique: AI-Augmented Learning

```
"I want to learn [concept] while implementing [feature]:

1. Explain the concept
2. Show example in isolation
3. Apply to our feature
4. Explain design decisions
5. Show best practices
6. Show anti-patterns to avoid
7. Give me exercises to practice

Goal: Learn by doing with understanding"
```

---

## Prochaines Étapes

Techniques avancées maîtrisées ! Continuez avec :

- [07_SaaS_Patterns.md](07_SaaS_Patterns.md) - Patterns spécifiques SaaS
- [08_Team_Collaboration.md](08_Team_Collaboration.md) - Collaboration d'équipe

---

*Dernière mise à jour : Décembre 2025*
