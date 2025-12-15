# ⚡ GoBeyondFit Agents – Quick Prompts Cheatsheet

**Goal:** Fast starter prompts for each agent, ready to paste into your Copilot chat.

> Tip: Always keep the corresponding agent file open in the context using `@workspace #file:.copilot/agents/XX-...-agent.md`.

---

## 🔒 01 – Security Agent

**Audit current file**
```
@workspace #file:.copilot/agents/01-security-agent.md

Review the currently open file for security vulnerabilities.
Focus on:
- Authentication/authorization
- IDOR and multi-tenancy
- Input validation
Generate a report with prioritized findings (P0/P1/P2).
```

**Full backend audit**
```
@workspace #file:.copilot/agents/01-security-agent.md

Run a full security audit on backend/src/ and produce:
- Top 10 vulnerabilities
- Severity (P0/P1/P2)
- Recommended fixes
```

---

## 🧪 02 – Testing Agent

**Unit tests for current file**
```
@workspace #file:.copilot/agents/02-testing-agent.md

Create unit tests for the currently open file and
aim for ~80% coverage where reasonable. Cover:
- Happy paths
- Error handling
- Edge cases.
```

**Module tests (programs)**
```
@workspace #file:.copilot/agents/02-testing-agent.md

Create unit and integration tests for backend/src/programs/.
Prioritize critical flows, multi-tenancy behavior, and soft deletes.
```

---

## 🏗️ 03 – Architecture Agent

**Design feature architecture**
```
@workspace #file:.copilot/agents/03-architecture-agent.md

Design the backend + frontend architecture for this feature:
[FEATURE_NAME]
Include modules, services, controllers, and main data flows.
```

**Review module structure**
```
@workspace #file:.copilot/agents/03-architecture-agent.md

Review the architecture of this module:
#file:[MODULE_PATH]

Check layering, boundaries, and alignment with GoBeyondFit standards.
```

---

## ⚡ 04 – Performance Agent

**Optimize slow endpoint**
```
@workspace #file:.copilot/agents/04-performance-agent.md

The endpoint [METHOD] [PATH] is slow (~[TIME] ms).
Analyze the related code and Prisma queries and propose
optimizations to target < 100 ms p95.
```

**Find N+1 queries**
```
@workspace #file:.copilot/agents/04-performance-agent.md

Scan backend/src/ for N+1 query patterns and list all
occurrences with file paths and suggested Prisma include/select fixes.
```

---

## 🔌 05 – API Agent

**Design API for new feature**
```
@workspace #file:.copilot/agents/05-api-agent.md

Design REST endpoints for this feature:
[FEATURE_NAME]
Return:
- Route list (method + path)
- DTOs with validation
- Example responses and error cases.
```

**Generate OpenAPI docs**
```
@workspace #file:.copilot/agents/05-api-agent.md

Add complete OpenAPI documentation to this controller:
#file:[CONTROLLER_PATH]

Include @ApiOperation, @ApiResponse, and @ApiParam/@ApiQuery where needed.
```

---

## 🗄️ 06 – Database Agent

**Design Prisma schema**
```
@workspace #file:.copilot/agents/06-database-agent.md

Design the Prisma schema for this feature:
[FEATURE_NAME]
Respect GoBeyondFit patterns:
- Multi-tenancy (userId/coachId)
- Soft deletes (deletedAt)
- Proper indexes.
```

**Optimize queries in file**
```
@workspace #file:.copilot/agents/06-database-agent.md

Analyze Prisma queries in this file:
#file:[FILE_PATH]

Suggest optimizations for:
- Missing indexes
- N+1 queries
- Unnecessary data loading.
```

---

## 🔀 07 – Session Manager Agent

**End-of-day report**
```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Generate an end-of-day session report:
- Summarize work done
- Map progress to roadmap/PRD.md
- List risks/blockers and next steps.
```

**Pre-PR check**
```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Current branch: [feature/branch-name]

Run a pre-PR check:
- Analyze changes on this branch
- Call other agents as needed (Security, Testing, API, Frontend, Docs)
- Validate quality gates
- Propose a PR title and checklist.
```

---

## 📚 08 – Documentation Agent

**Document new feature**
```
@workspace #file:.copilot/agents/08-documentation-agent.md

I just added feature X.
Create:
1. JSDoc comments
2. README section
3. Architecture diagram
4. Usage examples.
```

**Update main README**
```
@workspace #file:.copilot/agents/08-documentation-agent.md

Update the main README for GoBeyondFit with:
- New dependencies
- New pnpm scripts
- New or changed endpoints and features.
```

---

## 👀 09 – Code Review Agent

**Review pull request**
```
@workspace #file:.copilot/agents/09-code-review-agent.md

Review this pull request for:
- Security issues
- Test quality
- Performance and code smells
End with a verdict: APPROVE / REQUEST CHANGES / BLOCK.
```

**Review key service file**
```
@workspace #file:.copilot/agents/09-code-review-agent.md

Review this file:
#file:backend/src/programs/programs.service.ts

Focus on multi-tenancy, error handling, and performance.
```

---

## 🚀 10 – DevOps & CI/CD Agent

**Setup CI/CD pipeline**
```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md

Create a GitHub Actions pipeline that:
- Runs backend and frontend tests
- Publishes coverage reports
- Deploys on pushes to main when tests pass.
```

**Production deployment plan**
```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md

I am ready to deploy GoBeyondFit to production.
Recommend a platform (e.g. Railway vs Render) and
outline the full deployment steps.
```

---

## 🎨 11 – Frontend UX/UI Agent

**Design Athlete Dashboard**
```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md

Design the "Athlete Dashboard" page:
- Sidebar + main content layout
- Metrics cards (top)
- Activity feed (left)
- Upcoming workouts (right)
- Use shadcn/ui components and Tailwind.
```

**Optimize heavy list component**
```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md

This WorkoutList component is slow with 200+ items.
Optimize it using:
- Virtualization
- Memoization
- Lazy loading of heavy subcomponents.
```

---

## 💡 12 – Innovation Agent

**Brainstorm time-saving features**
```
@workspace #file:.copilot/agents/12-innovation-agent.md

Brainstorm 5 features to
"reduce program creation time from 2h to 10min".
Focus on free/freemium services and coach UX.
```

**Evaluate innovation idea**
```
@workspace #file:.copilot/agents/12-innovation-agent.md

Evaluate this idea:
"AI-generated workout plans based on athlete goals".
Assess:
- Time saved for coaches
- Cost (free tier or low cost?)
- Technical complexity
- Value for athletes
- Go/No-Go recommendation.
```

---

## 🔍 13 – Tech Scout Agent

**Weekly tech review**
```
@workspace #file:.copilot/agents/13-tech-scout-agent.md

Run the weekly tech review:
1. GitHub Trending (TypeScript)
2. Latest Next.js/React updates
3. Prisma and NestJS updates
4. Recommendations for GoBeyondFit (if any).
```

**Evaluate new tool**
```
@workspace #file:.copilot/agents/13-tech-scout-agent.md

Evaluate this tool: [TOOL_NAME]
- Possible use cases for GoBeyondFit
- Comparison with our current stack
- Need for a POC? (Yes/No)
- Score /30
- Recommendation (Adopt / Monitor / Reject).
```

---

## 💪 14 – Fitness Domain Agent

**Validate training program**
```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md

Validate this training program:
#file:[PROGRAM_PATH]

Check:
- Weekly volume vs MEV/MRV
- Movement and push/pull balance
- Recovery between hard sessions
- Periodization and deloads.
```

**Design 4-week block**
```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md

Design a 4-week upper-body hypertrophy block
for an advanced athlete (4 days/week, full gym).
Include weekly volume per muscle group
and sensible progression across weeks.
```

---

## 🔄 15 – Migration Agent

**Plan schema migration**
```
@workspace #file:.copilot/agents/15-migration-agent.md

Plan this database schema migration:
[DESCRIBE_SCHEMA_CHANGE]
Ensure it is backward compatible and includes
rollback strategy and data migration steps.
```

**Review migration script**
```
@workspace #file:.copilot/agents/15-migration-agent.md

Review this migration script:
#file:prisma/migrations/[MIGRATION_NAME]/migration.sql

Check for safety, performance, and data consistency.
```

---

**Usage:** Keep this file open or pinned and copy-paste the relevant block
into Copilot chat whenever you want to quickly "summon" the right agent for a task.
