# 🤖 GoBeyondFit Copilot Agents

**Complete agent system for optimized development workflow**

---

## 📖 Quick Start

### Using Agents in Copilot Chat

```
@workspace #file:.copilot/agents/[AGENT-NUMBER]-[AGENT-NAME].md

[Your prompt here]
```

**Example:**
```
@workspace #file:.copilot/agents/01-security-agent.md

Review this authentication service for vulnerabilities:
#file:backend/src/auth/auth.service.ts
```

---

## 🗂️ Agent Directory

### 🔴 Critical Agents (Use Frequently)

#### 01. 🔒 Security Agent
**When to use:** Before merging any auth/data access code  
**Focus:** OWASP Top 10, JWT auth, IDOR prevention, multi-tenancy  
**File:** [01-security-agent.md](./agents/01-security-agent.md)

```
@workspace #file:.copilot/agents/01-security-agent.md
Review this endpoint for security issues
```

#### 02. 🧪 Testing Agent
**When to use:** Creating tests, improving coverage  
**Focus:** Jest unit/integration tests, 70-80% coverage target  
**File:** [02-testing-agent.md](./agents/02-testing-agent.md)

```
@workspace #file:.copilot/agents/02-testing-agent.md
Generate unit tests for this service
```

#### 03. 🏗️ Architecture Agent
**When to use:** Designing new features, refactoring  
**Focus:** NestJS patterns, service/controller separation, DTOs  
**File:** [03-architecture-agent.md](./agents/03-architecture-agent.md)

```
@workspace #file:.copilot/agents/03-architecture-agent.md
Design the architecture for workout assignment feature
```

#### 07. 🗂️ Session Manager Agent
**When to use:** End of day, pre-commit, weekly reviews  
**Focus:** Multi-agent orchestration, progress tracking, git workflow  
**File:** [07-session-manager-agent.md](./agents/07-session-manager-agent.md)

```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate end-of-day session report
```

---

### 🟠 Important Agents (Use Regularly)

#### 04. ⚡ Performance Agent
**When to use:** Slow queries, pagination, optimization  
**Focus:** Prisma query optimization, N+1 prevention, React memoization  
**File:** [04-performance-agent.md](./agents/04-performance-agent.md)

```
@workspace #file:.copilot/agents/04-performance-agent.md
Optimize this query (currently 500ms)
```

#### 05. 🔌 API Agent
**When to use:** Creating REST endpoints, OpenAPI docs  
**Focus:** REST standards, response formats, field selection  
**File:** [05-api-agent.md](./agents/05-api-agent.md)

```
@workspace #file:.copilot/agents/05-api-agent.md
Design CRUD API for workouts resource
```

#### 06. 🗄️ Database Agent
**When to use:** Schema changes, migrations, indexing  
**Focus:** Prisma schema, PostgreSQL, multi-tenancy, soft deletes  
**File:** [06-database-agent.md](./agents/06-database-agent.md)

```
@workspace #file:.copilot/agents/06-database-agent.md
Review this schema change for performance impact
```

#### 08. 📚 Documentation Agent
**When to use:** New features, API changes, README updates  
**Focus:** JSDoc, OpenAPI, architecture diagrams, English only  
**File:** [08-documentation-agent.md](./agents/08-documentation-agent.md)

```
@workspace #file:.copilot/agents/08-documentation-agent.md
Document this new authentication flow
```

#### 09. 👀 Code Review Agent
**When to use:** Before creating PR, refactoring  
**Focus:** Best practices, DRY, security, moderate strictness  
**File:** [09-code-review-agent.md](./agents/09-code-review-agent.md)

```
@workspace #file:.copilot/agents/09-code-review-agent.md
Review this PR for quality and security
```

#### 11. 🎨 Frontend UX/UI Agent
**When to use:** Building UI, optimizing UX, shadcn/ui components  
**Focus:** Linear-inspired design, coach time-saving, accessibility  
**File:** [11-frontend-ux-ui-agent.md](./agents/11-frontend-ux-ui-agent.md)

```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md
Design the athlete dashboard page
```

#### 14. 💪 Fitness Domain Agent
**When to use:** Program design, exercise science questions  
**Focus:** Periodization, progressive overload, elite athletes  
**File:** [14-fitness-domain-agent.md](./agents/14-fitness-domain-agent.md)

```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md
Validate this 12-week hypertrophy program
```

---

### 🟡 Specialized Agents (Use as Needed)

#### 10. 🚀 DevOps & CI/CD Agent
**When to use:** Deployment setup, Docker issues, CI/CD pipelines  
**Focus:** Local Docker Compose, Railway deployment, GitHub Actions  
**File:** [10-devops-cicd-agent.md](./agents/10-devops-cicd-agent.md)

```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md
Setup CI/CD pipeline for testing + deployment
```

#### 12. 💡 Innovation Agent
**When to use:** Brainstorming features, free service recommendations  
**Focus:** Hevy/Strong inspiration, coach time-saving, low-cost solutions  
**File:** [12-innovation-agent.md](./agents/12-innovation-agent.md)

```
@workspace #file:.copilot/agents/12-innovation-agent.md
Suggest 5 innovative features for elite coaches
```

#### 13. 🔍 Tech Scout Agent
**When to use:** Weekly tech review, evaluating new tools  
**Focus:** GitHub Trending, Prisma/Next.js updates, POC recommendations  
**File:** [13-tech-scout-agent.md](./agents/13-tech-scout-agent.md)

```
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Review this week's tech updates (TypeScript ecosystem)
```

#### 15. 🔄 Migration Agent
**When to use:** Schema changes, data migrations, rollback planning  
**Focus:** Zero-downtime migrations, expand-contract pattern, Prisma  
**File:** [15-migration-agent.md](./agents/15-migration-agent.md)

```
@workspace #file:.copilot/agents/15-migration-agent.md
Plan migration: rename "name" to "firstName" + "lastName"
```

---

## 🔄 Common Workflows

### 1. Starting New Feature
```bash
# Step 1: Architecture design
@workspace #file:.copilot/agents/03-architecture-agent.md
Design feature: Workout assignment to athletes

# Step 2: Database schema
@workspace #file:.copilot/agents/06-database-agent.md
Review this schema for workout assignments

# Step 3: Security check
@workspace #file:.copilot/agents/01-security-agent.md
Ensure multi-tenancy in workout assignment endpoints
```

### 2. Before Committing Code
```bash
# Step 1: Code review
@workspace #file:.copilot/agents/09-code-review-agent.md
Review changes before commit

# Step 2: Security audit
@workspace #file:.copilot/agents/01-security-agent.md
Quick security scan

# Step 3: Test coverage
@workspace #file:.copilot/agents/02-testing-agent.md
Check if new code has tests
```

### 3. End of Day Session
```bash
# Comprehensive session report
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate end-of-day session report with:
- Files modified
- Multi-agent audits (Security, Testing, Performance)
- PRD progress
- Git recommendations
- Next session goals
```

### 4. Performance Issues
```bash
# Step 1: Identify bottleneck
@workspace #file:.copilot/agents/04-performance-agent.md
Analyze slow API endpoint (500ms)

# Step 2: Database optimization
@workspace #file:.copilot/agents/06-database-agent.md
Review Prisma queries and indexes

# Step 3: Frontend optimization (if needed)
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md
Optimize React component re-renders
```

---

## 🎯 Agent Coordination (Session Manager)

The **Session Manager Agent** automatically calls other agents based on modified files:

```typescript
Modified Files → Agents Called
────────────────────────────────────────
*.service.ts     → Security, Testing, Performance, Code Review
*.controller.ts  → Security, API, Testing
schema.prisma    → Database, Performance, Security
*.tsx            → Frontend UX/UI, Performance, Code Review
*/dto/*          → API, Security
```

### ⚠️ Critical Workflow Dependencies

**IMPORTANT:** Some agents MUST be called in specific order:

```
Frontend Component Generation:
┌─────────────┐
│  Agent 13   │ → MUST verify dependencies FIRST
│ Tech Scout  │    (shadcn/ui, Radix UI packages)
└──────┬──────┘
       ↓
┌─────────────┐
│  Agent 11   │ → Then generate UI components
│ Frontend UX │    (imports verified dependencies)
└─────────────┘

❌ WRONG ORDER (Skip Agent 13):
Agent 11 → Generate components → Import errors → 3h lost

✅ CORRECT ORDER:
Agent 13 (verify deps) → Agent 11 (generate UI) → No errors
```

### Lessons Learned (2025-12-14)
```
🚨 INCIDENT: Coach Review Queue Implementation
- Agent 11 generated UI without calling Agent 13 first
- Missing @radix-ui packages caused 28 TypeScript errors
- 3 hours lost debugging dependency issues

PREVENTION:
✅ Always call Agent 13 BEFORE Agent 11 for frontend work
✅ Verify package.json has required dependencies
✅ Run dependency audit as first step of any UI generation
✅ See Agent 11 and Agent 13 docs for updated workflows
```

---

## 📁 Project Structure

```
.copilot/
└── agents/
    ├── README.md (this file)
    ├── commands.md (quick reference)
    ├── 01-security-agent.md
    ├── 02-testing-agent.md
    ├── 03-architecture-agent.md
    ├── 04-performance-agent.md
    ├── 05-api-agent.md
    ├── 06-database-agent.md
    ├── 07-session-manager-agent.md
    ├── 08-documentation-agent.md
    ├── 09-code-review-agent.md
    ├── 10-devops-cicd-agent.md
    ├── 11-frontend-ux-ui-agent.md
    ├── 12-innovation-agent.md
    ├── 13-tech-scout-agent.md
    ├── 14-fitness-domain-agent.md
    └── 15-migration-agent.md

roadmap/
├── PRD.md (Product Requirements Document)
└── sessions/ (Session reports generated by Session Manager)
```

---

## 🚀 Quick Reference

For fast copy-paste commands, see **[commands.md](./commands.md)**.

For richer, ready-to-use prompts per agent, see
**[quick-prompts-cheatsheet.md](./quick-prompts-cheatsheet.md)**.

---

## 📊 Agent Summary Table

| # | Agent | Priority | Use Case |
|---|-------|----------|----------|
| 01 | 🔒 Security | 🔴 Critical | Auth, IDOR, vulnerabilities |
| 02 | 🧪 Testing | 🔴 Critical | Unit/integration tests, coverage |
| 03 | 🏗️ Architecture | 🔴 Critical | Feature design, patterns |
| 04 | ⚡ Performance | 🟠 Important | Query optimization, N+1 |
| 05 | 🔌 API | 🟠 Important | REST endpoints, OpenAPI |
| 06 | 🗄️ Database | 🟠 Important | Schema, migrations, indexes |
| 07 | 🗂️ Session Manager | 🔴 Critical | End-of-day reports, orchestration |
| 08 | 📚 Documentation | 🟠 Important | JSDoc, README, diagrams |
| 09 | 👀 Code Review | 🟠 Important | Quality, best practices |
| 10 | 🚀 DevOps | 🟡 Specialized | Docker, CI/CD, deployment |
| 11 | 🎨 Frontend UX/UI | 🟠 Important | shadcn/ui, coach UX |
| 12 | 💡 Innovation | 🟡 Specialized | Feature ideas, free services |
| 13 | 🔍 Tech Scout | 🟡 Specialized | Weekly tech monitoring |
| 14 | 💪 Fitness Domain | 🟠 Important | Exercise science, programs |
| 15 | 🔄 Migration | 🟡 Specialized | Schema changes, rollbacks |

---

**Version:** 1.0  
**Last Updated:** 2024-12-11  
**Project:** GoBeyondFit Web Application
