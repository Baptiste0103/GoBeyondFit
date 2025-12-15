# ⚡ Quick Commands Reference

**Fast copy-paste commands for all agents**

---

## 🔴 Critical Agents

### 🔒 Security Agent
```
@workspace #file:.copilot/agents/01-security-agent.md
Review this file for security vulnerabilities:
#file:[FILE_PATH]
```

```
@workspace #file:.copilot/agents/01-security-agent.md
Security audit of authentication system
```

```
@workspace #file:.copilot/agents/01-security-agent.md
Verify multi-tenancy enforcement in this endpoint
```

---

### 🧪 Testing Agent
```
@workspace #file:.copilot/agents/02-testing-agent.md
Generate unit tests for:
#file:[FILE_PATH]
```

```
@workspace #file:.copilot/agents/02-testing-agent.md
Check test coverage and suggest missing tests
```

```
@workspace #file:.copilot/agents/02-testing-agent.md
Create E2E test for user authentication flow
```

---

### 🏗️ Architecture Agent
```
@workspace #file:.copilot/agents/03-architecture-agent.md
Design architecture for: [FEATURE_NAME]
```

```
@workspace #file:.copilot/agents/03-architecture-agent.md
Review this module structure for best practices
```

```
@workspace #file:.copilot/agents/03-architecture-agent.md
Suggest refactoring for this complex service
```

---

### 🗂️ Session Manager Agent
```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate end-of-day session report
```

```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Pre-commit check: ready to merge?
```

```
@workspace #file:.copilot/agents/07-session-manager-agent.md
Weekly progress report vs PRD
```

---

## 🟠 Important Agents

### ⚡ Performance Agent
```
@workspace #file:.copilot/agents/04-performance-agent.md
Optimize this slow query:
#file:[FILE_PATH]
```

```
@workspace #file:.copilot/agents/04-performance-agent.md
Review API endpoint performance (currently [TIME]ms)
```

```
@workspace #file:.copilot/agents/04-performance-agent.md
Identify N+1 queries in this service
```

---

### 🔌 API Agent
```
@workspace #file:.copilot/agents/05-api-agent.md
Design REST API for: [RESOURCE_NAME]
```

```
@workspace #file:.copilot/agents/05-api-agent.md
Generate OpenAPI documentation for this controller
```

```
@workspace #file:.copilot/agents/05-api-agent.md
Review API endpoint design and response formats
```

---

### 🗄️ Database Agent
```
@workspace #file:.copilot/agents/06-database-agent.md
Review this schema change:
#file:prisma/schema.prisma
```

```
@workspace #file:.copilot/agents/06-database-agent.md
Suggest indexes for performance optimization
```

```
@workspace #file:.copilot/agents/06-database-agent.md
Design database schema for: [FEATURE_NAME]
```

---

### 📚 Documentation Agent
```
@workspace #file:.copilot/agents/08-documentation-agent.md
Document this feature: [FEATURE_NAME]
```

```
@workspace #file:.copilot/agents/08-documentation-agent.md
Generate JSDoc comments for:
#file:[FILE_PATH]
```

```
@workspace #file:.copilot/agents/08-documentation-agent.md
Update README with new setup instructions
```

---

### 👀 Code Review Agent
```
@workspace #file:.copilot/agents/09-code-review-agent.md
Review this PR for quality and security
```

```
@workspace #file:.copilot/agents/09-code-review-agent.md
Review code changes:
#file:[FILE_PATH]
```

```
@workspace #file:.copilot/agents/09-code-review-agent.md
Identify code smells and suggest improvements
```

---

### 🎨 Frontend UX/UI Agent
```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md
Design page: [PAGE_NAME]
```

```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md
Optimize this component for performance:
#file:[COMPONENT_PATH]
```

```
@workspace #file:.copilot/agents/11-frontend-ux-ui-agent.md
Review UX flow: [FLOW_NAME]
```

---

### 💪 Fitness Domain Agent
```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md
Validate this training program:
#file:[PROGRAM_PATH]
```

```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md
Suggest exercise alternatives for: [EXERCISE_NAME]
(Context: [INJURY/EQUIPMENT/GOAL])
```

```
@workspace #file:.copilot/agents/14-fitness-domain-agent.md
Design 4-week training block:
- Goal: [STRENGTH/HYPERTROPHY/POWER]
- Frequency: [X] days/week
- Level: [BEGINNER/INTERMEDIATE/ADVANCED]
```

---

## 🟡 Specialized Agents

### 🚀 DevOps & CI/CD Agent
```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md
Setup CI/CD pipeline with GitHub Actions
```

```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md
Recommend production deployment platform
```

```
@workspace #file:.copilot/agents/10-devops-cicd-agent.md
Debug Docker Compose issue
```

---

### 💡 Innovation Agent
```
@workspace #file:.copilot/agents/12-innovation-agent.md
Brainstorm 5 features to save coaches time
```

```
@workspace #file:.copilot/agents/12-innovation-agent.md
Evaluate feature idea: [FEATURE_DESCRIPTION]
```

```
@workspace #file:.copilot/agents/12-innovation-agent.md
Find free API for: [USE_CASE]
```

---

### 🔍 Tech Scout Agent
```
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Weekly tech review (TypeScript ecosystem)
```

```
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Evaluate tool: [TOOL_NAME]
(Compare with current: [CURRENT_TOOL])
```

```
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Monthly dependency audit
```

---

### 🔄 Migration Agent
```
@workspace #file:.copilot/agents/15-migration-agent.md
Plan migration: [DESCRIBE_SCHEMA_CHANGE]
```

```
@workspace #file:.copilot/agents/15-migration-agent.md
Review this migration:
#file:prisma/migrations/[MIGRATION_NAME]/migration.sql
```

```
@workspace #file:.copilot/agents/15-migration-agent.md
Generate data migration script:
- Transform: [OLD_FORMAT] → [NEW_FORMAT]
- Records: [ESTIMATE]
```

---

## 🔄 Workflow Commands

### Feature Development (Complete Flow)
```bash
# 1. Architecture
@workspace #file:.copilot/agents/03-architecture-agent.md
Design feature: [FEATURE_NAME]

# 2. Database
@workspace #file:.copilot/agents/06-database-agent.md
Review schema for: [FEATURE_NAME]

# 3. API Design
@workspace #file:.copilot/agents/05-api-agent.md
Design API endpoints for: [FEATURE_NAME]

# 4. Security
@workspace #file:.copilot/agents/01-security-agent.md
Security review for: [FEATURE_NAME]

# 5. Testing
@workspace #file:.copilot/agents/02-testing-agent.md
Generate tests for: [FEATURE_NAME]

# 6. Documentation
@workspace #file:.copilot/agents/08-documentation-agent.md
Document feature: [FEATURE_NAME]
```

---

### Pre-Commit Workflow
```bash
# 1. Code Review
@workspace #file:.copilot/agents/09-code-review-agent.md
Review changes before commit

# 2. Security Check
@workspace #file:.copilot/agents/01-security-agent.md
Quick security scan

# 3. Test Coverage
@workspace #file:.copilot/agents/02-testing-agent.md
Verify test coverage ≥ 70%

# 4. Performance Check
@workspace #file:.copilot/agents/04-performance-agent.md
Check for N+1 queries or performance issues
```

---

### Weekly Review
```bash
# 1. Session Report
@workspace #file:.copilot/agents/07-session-manager-agent.md
Generate weekly progress report

# 2. Tech Updates
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Weekly tech review (GitHub Trending, Next.js updates)

# 3. Dependency Audit
@workspace #file:.copilot/agents/13-tech-scout-agent.md
Check for outdated dependencies and vulnerabilities
```

---

## 🎯 Multi-Agent Commands

### Complete Feature Audit
```
@workspace 
#file:.copilot/agents/01-security-agent.md
#file:.copilot/agents/02-testing-agent.md
#file:.copilot/agents/04-performance-agent.md
#file:.copilot/agents/09-code-review-agent.md

Complete audit of feature: [FEATURE_NAME]
- Security vulnerabilities
- Test coverage
- Performance issues
- Code quality
```

### Pre-Deployment Check
```
@workspace 
#file:.copilot/agents/01-security-agent.md
#file:.copilot/agents/02-testing-agent.md
#file:.copilot/agents/06-database-agent.md
#file:.copilot/agents/10-devops-cicd-agent.md

Pre-deployment checklist:
- Security audit passed?
- Tests passing (≥70% coverage)?
- Migrations ready?
- Rollback plan documented?
```

---

## 📋 Templates

### Bug Fix
```
@workspace #file:.copilot/agents/09-code-review-agent.md

I fixed bug: [BUG_DESCRIPTION]
Changes:
#file:[FILE_PATH]

Review:
- Is fix correct?
- Should I add test to prevent regression?
- Any side effects?
```

### Performance Issue
```
@workspace #file:.copilot/agents/04-performance-agent.md

Performance issue:
- Endpoint: [ENDPOINT]
- Current time: [TIME]ms
- Target: <200ms

Analyze and suggest optimizations
```

### New Developer Onboarding
```
@workspace #file:.copilot/agents/08-documentation-agent.md

Generate onboarding guide for new developer:
- Tech stack overview
- Setup instructions
- Architecture summary
- Common commands
```

---

**Tip:** Save frequently used commands in VS Code snippets for even faster access!

**Version:** 1.0  
**Last Updated:** 2024-12-11
