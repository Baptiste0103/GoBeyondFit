# 13. Agent System Integration Guide

**Complete guide to using the 15 Copilot agents in your daily workflow**

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Daily Workflow Integration](#daily-workflow-integration)
3. [Agent Usage Patterns](#agent-usage-patterns)
4. [Complete Feature Development Flow](#complete-feature-development-flow)
5. [Session Manager Workflow](#session-manager-workflow)
6. [Troubleshooting & Tips](#troubleshooting--tips)

---

## 🚀 Quick Start

### Where Are the Agents?

```
.copilot/agents/
├── README.md          → Full documentation
├── commands.md        → Quick copy-paste commands
├── 01-security-agent.md
├── 02-testing-agent.md
├── 03-architecture-agent.md
├── 04-performance-agent.md
├── 05-api-agent.md
├── 06-database-agent.md
├── 07-session-manager-agent.md  ⭐ ORCHESTRATOR
├── 08-documentation-agent.md
├── 09-code-review-agent.md
├── 10-devops-cicd-agent.md
├── 11-frontend-ux-ui-agent.md
├── 12-innovation-agent.md
├── 13-tech-scout-agent.md
├── 14-fitness-domain-agent.md
└── 15-migration-agent.md
```

### Basic Usage Pattern

```
@workspace #file:.copilot/agents/[AGENT-NUMBER]-[AGENT-NAME].md

[Your specific request]
```

**Example:**
```
@workspace #file:.copilot/agents/01-security-agent.md

Review this authentication service for vulnerabilities:
#file:backend/src/auth/auth.service.ts
```

---

## 🔄 Daily Workflow Integration

### Morning Routine (5 minutes)

#### 1. Check Yesterday's Session Report
```
Location: roadmap/sessions/

Open latest session report to see:
- What was accomplished
- Pending tasks
- Next session goals
```

#### 2. Plan Today's Work
```
@workspace #file:.copilot/agents/07-session-manager-agent.md
#file:roadmap/PRD.md

Review PRD and suggest top 3 priorities for today
```

---

### During Development

#### When Starting New Feature

**Step 1: Architecture Design** (15-30 min)
```
@workspace #file:.copilot/agents/03-architecture-agent.md

Design architecture for: [Feature Name]

Requirements:
- [List requirements]
- Multi-tenancy required
- Target: [Coach/Athlete]
```

**Output:** Full architecture with:
- Database schema changes
- API endpoints
- Service/Controller structure
- DTOs needed

**Step 2: Database Schema** (10 min)
```
@workspace #file:.copilot/agents/06-database-agent.md

Review this schema design:
#file:prisma/schema.prisma

New models: [List models]
Check for: indexes, multi-tenancy, soft deletes
```

**Step 3: Security Review** (10 min)
```
@workspace #file:.copilot/agents/01-security-agent.md

Security audit for new feature: [Feature Name]
Endpoints: [List endpoints]
Verify: JWT protection, multi-tenancy, input validation
```

---

#### While Coding

**Quick Security Check** (Any file)
```
@workspace #file:.copilot/agents/01-security-agent.md

Quick security check:
#file:[current-file.ts]
```

**Performance Optimization**
```
@workspace #file:.copilot/agents/04-performance-agent.md

This query is slow (500ms):
#file:backend/src/[...]/[...].service.ts

Optimize with Prisma best practices
```

**API Design**
```
@workspace #file:.copilot/agents/05-api-agent.md

Design REST endpoints for: [Resource]
CRUD operations + filtering + pagination
```

---

#### After Coding (Before Commit)

**Pre-Commit Checklist** (10-15 min)

**Step 1: Generate Tests**
```
@workspace #file:.copilot/agents/02-testing-agent.md

Generate unit tests for:
#file:backend/src/[...]/[...].service.ts

Target coverage: 75%+
```

**Step 2: Code Review**
```
@workspace #file:.copilot/agents/09-code-review-agent.md

Review changes before commit:
- Security
- Best practices
- Code smells

Files modified:
#file:[file1.ts]
#file:[file2.ts]
```

**Step 3: Documentation**
```
@workspace #file:.copilot/agents/08-documentation-agent.md

Update documentation for new feature:
- JSDoc comments
- OpenAPI annotations
- README (if needed)
```

---

### End of Day (15 minutes)

#### Generate Session Report (CRITICAL)

```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Generate end-of-day session report:
1. Analyze git diff
2. Run multi-agent audits (Security, Testing, Performance, Code Review)
3. Compare progress vs PRD
4. Suggest next steps
5. Save report to roadmap/sessions/
```

**What Session Manager Does:**
1. ✅ Detects all modified files (via `git diff`)
2. ✅ Calls relevant agents based on file types:
   - `*.service.ts` → Security, Testing, Performance, Code Review
   - `*.controller.ts` → Security, API, Testing
   - `schema.prisma` → Database, Performance, Security
   - `*.tsx` → Frontend UX/UI, Performance
3. ✅ Generates concise report (300-500 words)
4. ✅ Tracks PRD progress
5. ✅ Recommends Git actions (merge, squash, etc.)
6. ✅ Lists top 3 priorities for next session

**Output Location:**
```
roadmap/sessions/2024-12-11-afternoon.md
```

---

## 🎯 Agent Usage Patterns

### By Frequency

#### 🔴 Use Daily (Every Session)

**Session Manager** - End of day
```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate end-of-day session report
```

**Security Agent** - Before commit
```
@workspace #file:.copilot/agents/01-security-agent.md
Security audit of modified files
```

**Testing Agent** - After coding
```
@workspace #file:.copilot/agents/02-testing-agent.md
Generate tests for new code
```

---

#### 🟠 Use Weekly

**Code Review Agent** - Before PR
```
@workspace #file:.copilot/agents/09-code-review-agent.md
Review feature branch before merging to main
```

**Tech Scout Agent** - Monday morning
```
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Weekly tech review:
- GitHub Trending (TypeScript)
- Next.js/Prisma updates
- Security advisories
```

**Session Manager** - Weekly progress
```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate weekly progress report vs PRD
```

---

#### 🟡 Use As Needed

**Architecture Agent** - New features
```
@workspace #file:.copilot/agents/03-architecture-agent.md
Design feature: [Name]
```

**Performance Agent** - Slow queries
```
@workspace #file:.copilot/agents/04-performance-agent.md
Optimize endpoint (currently 500ms)
```

**Innovation Agent** - Brainstorming
```
@workspace #file:.copilot/agents/12-innovation-agent.md
Suggest 5 time-saving features for coaches
```

**Migration Agent** - Schema changes
```
@workspace #file:.copilot/agents/15-migration-agent.md
Plan zero-downtime migration for [change]
```

---

### By File Type

When you're editing a specific file type:

| File Type | Recommended Agents |
|-----------|-------------------|
| `*.service.ts` | Security → Testing → Performance → Code Review |
| `*.controller.ts` | Security → API → Testing |
| `schema.prisma` | Database → Performance → Security → Migration |
| `*.dto.ts` | API → Security |
| `*.tsx` | Frontend UX/UI → Performance → Code Review |
| `*.spec.ts` | Testing |
| `README.md` | Documentation |
| `docker-compose.yml` | DevOps |

---

## 📋 Complete Feature Development Flow

### Example: "Workout Assignment to Athletes"

#### Phase 1: Planning (30 min)

**1.1 Architecture Design**
```
@workspace #file:.copilot/agents/03-architecture-agent.md

Design feature: Workout Assignment to Athletes

Requirements:
- Coach assigns program workouts to specific athletes
- Multi-tenancy: Coach sees only their athletes
- Athlete sees only their assigned workouts
- Support bulk assignment (multiple athletes)

Deliverables:
- Database schema changes
- API endpoints design
- Service/Controller structure
```

**1.2 Fitness Domain Validation**
```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md

Validate workout assignment logic:
- Can coach assign same workout to multiple athletes?
- Should workout be copied or referenced?
- How to handle workout modifications after assignment?
- Progressive overload tracking per athlete
```

**1.3 Database Schema**
```
@workspace #file:.copilot/agents/06-database-agent.md

Review schema for workout assignments:
- New models/fields needed
- Indexes for performance
- Multi-tenancy enforcement
- Cascade behavior on deletes
```

---

#### Phase 2: Implementation (2-3 hours)

**2.1 Create Database Migration**
```bash
# In terminal
pnpm prisma migrate dev --name add_workout_assignments
```

**2.2 Security Review (Before coding)**
```
@workspace #file:.copilot/agents/01-security-agent.md

Security checklist for workout assignments:
- Verify coach can only assign to their athletes
- Verify athlete can only view their assignments
- Input validation on assignment data
```

**2.3 Implement Backend**

Code normally, but use agents for guidance:

```
@workspace #file:.copilot/agents/05-api-agent.md

Design REST endpoints for workout assignments:
POST   /athletes/:athleteId/workouts
GET    /athletes/:athleteId/workouts
DELETE /athletes/:athleteId/workouts/:workoutId
```

**2.4 Performance Check**
```
@workspace #file:.copilot/agents/04-performance-agent.md

Review this query for N+1 issues:
#file:backend/src/workouts/workouts.service.ts
```

---

#### Phase 3: Testing (1 hour)

**3.1 Generate Tests**
```
@workspace #file:.copilot/agents/02-testing-agent.md

Generate comprehensive tests for workout assignments:
#file:backend/src/workouts/workouts.service.ts
#file:backend/src/workouts/workouts.controller.ts

Include:
- Unit tests (service logic)
- Integration tests (API endpoints)
- Edge cases (invalid IDs, unauthorized access)
```

**3.2 Run Tests**
```bash
pnpm test:cov
```

**3.3 Verify Coverage**
```
@workspace #file:.copilot/agents/02-testing-agent.md

Check test coverage for workout assignments feature.
Target: ≥75% overall
```

---

#### Phase 4: Frontend (2-3 hours)

**4.1 UI Design**
```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md

Design UI for workout assignment:
- Coach view: Select athletes, assign workout
- Athlete view: See assigned workouts
- Target: < 30 seconds to assign workout to 5 athletes
- Use shadcn/ui components
```

**4.2 Implementation**

Code frontend, then optimize:

```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md

Optimize this component (slow with 50+ athletes):
#file:frontend/components/AthleteSelector.tsx

Use: React.memo, virtualization, debouncing
```

---

#### Phase 5: Documentation (30 min)

**5.1 Generate Docs**
```
@workspace #file:.copilot/agents/08-documentation-agent.md

Document workout assignment feature:
- JSDoc comments for services
- OpenAPI annotations for endpoints
- Update README with new API routes
- Architecture diagram (Mermaid.js)
```

---

#### Phase 6: Pre-Merge Review (30 min)

**6.1 Comprehensive Review**
```
@workspace #file:.copilot/agents/09-code-review-agent.md

Complete code review for workout assignment feature:
- Code quality
- Best practices
- Security
- Performance
- Testing

Files:
#file:backend/src/workouts/
#file:frontend/components/WorkoutAssignment/
```

**6.2 Final Security Audit**
```
@workspace #file:.copilot/agents/01-security-agent.md

Final security audit before merging:
- Multi-tenancy verified?
- All endpoints protected?
- Input validation complete?
```

---

#### Phase 7: Deployment Prep (15 min)

**7.1 Migration Plan**
```
@workspace #file:.copilot/agents/15-migration-agent.md

Review migration for workout assignments:
#file:prisma/migrations/[...]/migration.sql

Verify:
- Backward compatible?
- Indexes present?
- Rollback plan documented?
```

**7.2 End-of-Feature Session Report**
```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Generate feature completion report:
- Summary of workout assignment implementation
- All audits passed?
- PRD task marked complete
- Ready to merge?
- Next feature recommendations
```

---

## 🗂️ Session Manager Workflow

### Understanding Session Manager

**Session Manager = Your AI Project Manager**

It's the **most important agent** because it:
1. ✅ Orchestrates all other agents
2. ✅ Tracks progress vs PRD
3. ✅ Generates actionable reports
4. ✅ Identifies blockers
5. ✅ Recommends next steps

---

### When to Use Session Manager

| Scenario | Command |
|----------|---------|
| **End of Day** | Generate end-of-day session report |
| **Before Commit** | Pre-commit check: ready to merge? |
| **After Feature** | Feature completion report |
| **Weekly Review** | Weekly progress report vs PRD |
| **Pre-Deployment** | Pre-deployment checklist |

---

### Session Manager Outputs

#### 1. End-of-Day Report

**Location:** `roadmap/sessions/2024-12-11-afternoon.md`

**Contains:**
- 📝 Summary (1-2 sentences)
- 📁 Modified files (status: ✅/⚠️/❌)
- 🔒 Security audit results
- 🧪 Test coverage metrics
- ⚡ Performance analysis
- 👀 Code review findings
- 📊 PRD progress (completed/in-progress/next)
- 🔀 Git recommendations
- 🎯 Next session goals (top 3 priorities)

**Reading Time:** 2-3 minutes  
**Action Items:** Clear, prioritized

---

#### 2. Git Workflow Recommendations

Session Manager analyzes your commits and suggests:

```
📝 Commit Messages:
✅ Follow convention: feat(programs): add CRUD operations
⚠️ Too vague: "updated stuff" → Improve message

🔀 Branch Management:
✅ Ready to merge to main
⚠️ Consider squashing 8 commits → 3 logical commits
❌ Conflicts with main → Rebase required

📋 Pre-Merge Checklist:
- [x] Tests passing (coverage: 78%)
- [x] Security audit passed
- [ ] Documentation updated ← ACTION NEEDED
- [x] No console.log()
- [x] Linter passed
```

---

#### 3. Quality Gates (Pass/Fail)

Session Manager checks:

```
🔴 CRITICAL (Must Pass):
✅ Security: No high/critical vulnerabilities
✅ Tests: Coverage ≥ 70%
✅ Multi-tenancy: Enforced on all queries
⚠️ Linter: 2 warnings (non-blocking)

🟡 WARNING (Review):
✅ Performance: API < 200ms (p95)
⚠️ Code Review: Minor duplication in workout.service.ts
✅ Documentation: OpenAPI updated

Verdict: ✅ READY TO MERGE (1 minor issue to address)
```

---

### Session Manager Automation

#### Auto-Detection of File Changes

Session Manager automatically calls agents based on what you modified:

```typescript
// Pseudo-logic:
if (file.endsWith('.service.ts')) {
  call([SecurityAgent, TestingAgent, PerformanceAgent, CodeReviewAgent]);
}

if (file.endsWith('.controller.ts')) {
  call([SecurityAgent, APIAgent, TestingAgent]);
}

if (file.includes('schema.prisma')) {
  call([DatabaseAgent, PerformanceAgent, SecurityAgent]);
}

if (file.endsWith('.tsx')) {
  call([FrontendUXUIAgent, PerformanceAgent, CodeReviewAgent]);
}
```

**You don't specify which agents to call** - Session Manager knows!

---

### Best Practices

#### 1. Generate Reports Frequently

```
✅ DO:
- End of every coding session (daily)
- Before merging feature branch
- Weekly progress review
- Pre-deployment

❌ DON'T:
- Skip session reports (lose progress tracking)
- Only generate reports when things go wrong
```

#### 2. Act on Recommendations

```
Session Manager: "⚠️ Coverage dropped to 68% (target: 70%)"

✅ DO: Immediately add missing tests
❌ DON'T: Ignore and merge anyway
```

#### 3. Track PRD Progress

Session Manager compares your work vs PRD:

```
PRD Task 1.3: Workout Assignment
Status: In Progress (75%)

Completed:
- [x] Database schema
- [x] Backend API
- [x] Tests

Pending:
- [ ] Frontend UI (estimated: 2h)
- [ ] Documentation

Blocker: None

Session Manager Recommendation:
"Focus next session on Frontend UI to complete Task 1.3"
```

---

## 🛠️ Troubleshooting & Tips

### Common Issues

#### 1. Agent Doesn't Respond as Expected

**Problem:** Agent gives generic answer, not GoBeyondFit-specific

**Solution:** Reference specific files
```
❌ BAD:
@workspace #file:.copilot/agents/01-security-agent.md
Review authentication

✅ GOOD:
@workspace #file:.copilot/agents/01-security-agent.md
Review this authentication service for IDOR vulnerabilities:
#file:backend/src/auth/auth.service.ts

Context: Multi-tenancy (userId-based isolation)
```

---

#### 2. Session Manager Report Too Long

**Problem:** Report is 1000+ words, hard to read

**Solution:** Ask for concise format
```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Generate CONCISE end-of-day report (300-500 words MAX):
- Summary: 1-2 sentences
- Files: List only
- Audits: Pass/Fail only (no details unless failed)
- Top 3 next steps
```

---

#### 3. Conflicting Agent Recommendations

**Example:**
- Performance Agent: "Remove this index (unused)"
- Database Agent: "Add this index (needed for query)"

**Solution:** Use Code Review Agent as tiebreaker
```
@workspace #file:.copilot/agents/09-code-review-agent.md

Conflicting recommendations on index for `users(email)`:
- Performance Agent: Remove (unused)
- Database Agent: Keep (needed)

Analyze actual query usage and decide.
```

---

### Pro Tips

#### 1. Create Saved Prompts (VS Code Snippets)

```json
// .vscode/copilot.code-snippets
{
  "End of Day Report": {
    "prefix": "eod",
    "body": [
      "@workspace #file:.copilot/agents/07-session-manager-agent.md",
      "",
      "Generate end-of-day session report"
    ]
  },
  "Security Check": {
    "prefix": "sec",
    "body": [
      "@workspace #file:.copilot/agents/01-security-agent.md",
      "",
      "Quick security check:",
      "#file:$TM_FILEPATH"
    ]
  }
}
```

Usage: Type `eod` + Tab → Instant prompt

---

#### 2. Combine Multiple Agents

For comprehensive audits:

```
@workspace 
#file:.copilot/agents/01-security-agent.md
#file:.copilot/agents/02-testing-agent.md
#file:.copilot/agents/04-performance-agent.md

Complete audit of programs module:
#file:backend/src/programs/

Provide:
- Security issues
- Test coverage gaps
- Performance bottlenecks
```

---

#### 3. Use Agents for Learning

```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md

Explain progressive overload principles for hypertrophy.
How should I implement this in the program builder?
```

Agents are **educational** too, not just tools!

---

#### 4. Reference PRD in Prompts

```
@workspace 
#file:.copilot/agents/07-session-manager-agent.md
#file:roadmap/PRD.md

Compare current implementation vs PRD Phase 1 roadmap.
What's completed? What's next priority?
```

---

### Integration with Existing Tools

#### Git Workflow

```bash
# 1. Code all day
# ... (your normal work)

# 2. End of day: Generate report
# (Use Session Manager in Copilot Chat)

# 3. Review report, act on recommendations

# 4. Commit changes
git add .
git commit -m "feat(workouts): add assignment to athletes"

# 5. Push and create PR
git push origin feature/workout-assignment

# 6. Before merging: Final review
# (Use Code Review Agent + Security Agent)
```

---

#### Testing Workflow

```bash
# 1. Write code
# ... 

# 2. Generate tests with agent
@workspace #file:.copilot/agents/02-testing-agent.md
Generate tests for: #file:backend/src/[...].service.ts

# 3. Run tests
pnpm test

# 4. Fix failures (if any)

# 5. Check coverage
pnpm test:cov

# 6. If < 70%: Ask Testing Agent for more tests
```

---

## 📊 Measuring Success

### Metrics to Track

Track these in weekly Session Manager reports:

```
Week 50 (Dec 11-17, 2024):
────────────────────────────
✅ PRD Progress:      35% → 42% (+7%)
✅ Test Coverage:     68% → 74% (+6%)
✅ Security Issues:   3 → 0 (all fixed)
✅ Features Shipped:  2 (Workout Assignment, Exercise Library)
✅ Code Reviews:      4 PRs merged
⚠️ Performance:      API p95: 220ms (target: <200ms)

Blockers: None
Velocity: 🟢 On Track
Next Week Focus: Performance optimization, Athlete Dashboard
```

---

### ROI of Agent System

**Time Saved Per Week:**

| Task | Without Agents | With Agents | Saved |
|------|----------------|-------------|-------|
| Security audits | 2h | 30min | 1.5h |
| Test generation | 3h | 1h | 2h |
| Code reviews | 2h | 45min | 1.25h |
| Documentation | 1.5h | 30min | 1h |
| Architecture design | 3h | 1.5h | 1.5h |
| **TOTAL** | **11.5h** | **4.25h** | **7.25h** |

**7+ hours saved per week = Almost 1 full day!**

---

## 🎯 Next Steps

### 1. Start Using Today

**First Session:**
```
@workspace #file:.copilot/agents/07-session-manager-agent.md

Generate my first session report (even if no changes yet).
This will establish the baseline.
```

---

### 2. Establish Daily Routine

**Morning (5 min):**
- Review yesterday's session report
- Plan top 3 priorities

**During Dev:**
- Use agents as needed (Security, Testing, Performance)

**End of Day (15 min):**
- Generate session report
- Review recommendations
- Plan tomorrow

---

### 3. Weekly Review

**Every Monday:**
```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate weekly progress report vs PRD

@workspace #file:.copilot/agents/13-tech-scout-agent.md
Weekly tech review (GitHub Trending, updates)
```

---

### 4. Iterate and Improve

After 2 weeks:
- Review session reports
- Identify patterns (recurring issues?)
- Adjust workflow
- Create custom shortcuts (VS Code snippets)

---

## 📚 Additional Resources

- **Full Agent Docs:** `.copilot/agents/README.md`
- **Quick Commands:** `.copilot/agents/commands.md`
- **PRD:** `roadmap/PRD.md`
- **Session Reports:** `roadmap/sessions/`

---

## 🎉 Conclusion

**The agent system is your AI development team:**

- 🔒 **Security Agent** = Security Engineer
- 🧪 **Testing Agent** = QA Engineer
- 🏗️ **Architecture Agent** = Senior Architect
- ⚡ **Performance Agent** = Performance Engineer
- 🗂️ **Session Manager** = Project Manager
- ... and 10 more specialists!

**Use them daily, trust their recommendations, and watch your productivity soar! 🚀**

---

**Pro Tip:** Bookmark this page. Re-read Section 2 (Daily Workflow) every week for the first month until it becomes muscle memory.

**Version:** 1.0  
**Last Updated:** 2024-12-11  
**Next Update:** After 1 month of usage (feedback-driven improvements)
