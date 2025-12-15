# 🔗 GitHub MCP Integration Guide

**Purpose:** Enable agents to communicate and coordinate via GitHub Issues  
**MCP Server:** `github-mcp-server`  
**Status:** Ready to implement

---

## 📦 INSTALLATION

### Step 1: Install GitHub MCP Server

```bash
# Option 1: Go installation (recommended)
go install github.com/github/github-mcp-server@latest

# Option 2: npm package (if available)
npm install -g @github/mcp-server

# Verify installation
github-mcp-server --version
```

### Step 2: Configure Claude Desktop

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "github-mcp-server",
      "env": {
        "GITHUB_TOKEN": "ghp_your_personal_access_token",
        "GITHUB_OWNER": "your-username",
        "GITHUB_REPO": "GoBeyondFitWebApp"
      }
    }
  }
}
```

### Step 3: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Token name: `agent-orchestration`
3. Scopes required:
   - ✅ `repo` (full repository access)
   - ✅ `workflow` (GitHub Actions)
   - ✅ `read:org` (read organization data)
4. Generate token
5. Copy to `claude_desktop_config.json`

---

## 🎯 MCP CAPABILITIES FOR WORKFLOW

### Available GitHub MCP Tools

```typescript
// Tools used by Orchestrator

1. mcp_io_github_git_create_issue
   - Create tracking issue for workflow
   - Assign agents as collaborators
   - Add labels (orchestrated-workflow, high-risk, etc.)

2. mcp_io_github_git_create_pull_request
   - Create PR when implementation complete
   - Link to tracking issue
   - Auto-assign reviewers

3. mcp_io_github_git_list_issues
   - Monitor active workflows
   - Check blocker status
   - Track progress

4. mcp_io_github_git_update_issue
   - Add comments (stage updates)
   - Change labels (in-progress → blocked → completed)
   - Update assignees (pass to next agent)

5. mcp_io_github_git_search_issues
   - Find related work
   - Check for duplicate workflows
   - Historical analysis

6. mcp_io_github_git_assign_copilot_to_issue
   - Assign Copilot agent to specific issues
   - Automated code generation for subtasks
```

---

## 🔄 ORCHESTRATION VIA GITHUB ISSUES

### Workflow Lifecycle

```
1. USER REQUEST
   ↓
2. ORCHESTRATOR creates GitHub Issue
   Title: [ORCHESTRATOR] Feature Name
   Body: Complete pipeline breakdown
   Labels: orchestrated-workflow, complexity-moderate, risk-high
   ↓
3. ORCHESTRATOR assigns first agent
   Assignee: @01-security-agent
   Comment: "Stage 1: Security pre-validation required"
   ↓
4. AGENT completes task
   Comment: "✅ Stage 1 complete - Security approved"
   Label: stage-1-complete
   ↓
5. ORCHESTRATOR updates issue
   Assignee: @03-architecture-agent (next agent)
   Comment: "Stage 2: Architecture design"
   ↓
6. ... (repeat for all stages)
   ↓
7. ORCHESTRATOR closes issue
   Comment: "🎉 Workflow complete - All gates passed"
   Label: completed
   Milestone: Version X.Y.Z
```

### Example: Issue Creation

```typescript
// Orchestrator creates tracking issue
const issue = await mcp_io_github_git_create_issue({
  owner: 'your-username',
  repo: 'GoBeyondFitWebApp',
  title: '[ORCHESTRATOR] Add Review Queue Filters',
  body: `
## 🎯 Feature Request

Add filtering capabilities to Review Queue:
- Filter by studentId
- Filter by reviewStatus
- Filter by date range
- Pagination support

## 📊 Workflow Pipeline

### Stage 1: Analysis & Planning (30 min)
- [ ] @01-security-agent: Pre-validate multi-tenancy approach
- [ ] @03-architecture-agent: Confirm design patterns
- [ ] @06-database-agent: Plan schema changes (data loss check)

**Gate #1:** Security + Design + Data Safety ✅

### Stage 2: Implementation (2-3h)
- [ ] @06-database-agent: Add nullable fields (blockNumber, weekNumber, sessionNumber)
- [ ] @05-api-agent: Implement getReviewQueue(filters) with DTO validation
- [ ] @02-testing-agent: Generate 11 security tests
- [ ] @11-frontend-agent: Add filters UI + pagination

**Gate #2:** TypeScript valid + Build success + Tests pass ✅

### Stage 3: Quality Assurance (1h)
- [ ] @01-security-agent: Post-implementation security audit
- [ ] @16-performance-monitor: Benchmark getReviewQueue() query
- [ ] @04-performance-agent: Suggest indexes if >500ms

**Gate #3:** Security audit + Performance < 500ms + Coverage ≥ 80% ✅

### Stage 4: Documentation & Finalization (30 min)
- [ ] @08-documentation-agent: Update docs (consolidate if needed)
- [ ] @09-code-review-agent: Final review
- [ ] @07-session-manager: Generate completion report

**Gate #4:** Docs updated + All checks green ✅

---

## 🚨 Risk Assessment

**Complexity:** Moderate  
**Risk Level:** HIGH (multi-tenancy)  
**Estimated Duration:** 3-4h

### Critical Risks
1. **Multi-Tenancy Bypass:** Coach could access other coaches' students via filter
   - **Mitigation:** DTO validation + Service-level authorization check
2. **Data Loss:** Schema changes could affect existing data
   - **Mitigation:** Nullable fields + Migration validation
3. **Performance:** Complex queries with 5 JOINs
   - **Mitigation:** Indexes + Benchmarking

---

## 📋 Success Criteria

✅ All 4 validation gates passed  
✅ Zero TypeScript errors  
✅ 11 security tests pass (100%)  
✅ Query performance < 500ms (p95)  
✅ Test coverage ≥ 80%  
✅ Documentation updated  
✅ Zero data loss  

---

## 📊 Progress Tracking

**Current Stage:** Analysis & Planning  
**Current Agent:** @01-security-agent  
**Status:** 🟡 In Progress  
**Started:** 2025-12-15 10:30 UTC  
**ETA Completion:** 2025-12-15 14:00 UTC  
  `,
  labels: [
    'orchestrated-workflow',
    'complexity-moderate',
    'risk-high',
    'stage-1-analysis'
  ],
  assignees: ['01-security-agent']
})

console.log(`Created issue #${issue.number}`)
```

---

## 💬 AGENT COMMUNICATION PROTOCOL

### Comment Format (Standardized)

```markdown
### ✅ STAGE {N}: {STAGE_NAME} COMPLETE

**Agent:** @{agent-id}  
**Duration:** {minutes} min  
**Status:** {APPROVED|REJECTED|NEEDS_REVISION}

#### Outputs

{Key findings, decisions, artifacts}

#### Validations

- [x] Validation 1
- [x] Validation 2
- [ ] Validation 3 (failed - see details below)

#### Next Steps

{What needs to happen next}

#### Blockers

{Any issues preventing progress}

---

**Next Agent:** @{next-agent-id}  
**Next Task:** {Brief description}
```

### Example: Security Agent Comment

```markdown
### ✅ STAGE 1: Security Pre-Validation COMPLETE

**Agent:** @01-security-agent  
**Duration:** 15 min  
**Status:** APPROVED ✅

#### Outputs

**Risk Assessment:**
- **Multi-Tenancy Risk:** HIGH
- **Data Exposure Risk:** MEDIUM
- **Injection Risk:** LOW (Prisma parameterized queries)

**Required Mitigations:**
1. DTO Validation: `@IsUUID()` for studentId
2. Service Authorization: Validate `studentId IN (coach.studentIds)`
3. Security Tests: Minimum 11 tests covering multi-tenancy

**Security Contract Generated:**
```typescript
// MANDATORY: Implement these checks
if (filters?.studentId) {
  if (!authorizedStudentIds.includes(filters.studentId)) {
    throw new ForbiddenException('Access denied')
  }
}
```

#### Validations

- [x] Multi-tenancy approach validated
- [x] Authorization strategy defined
- [x] Security tests requirements specified
- [x] No blocking security concerns

#### Next Steps

Proceed to architecture design with security constraints in place.

#### Blockers

None

---

**Next Agent:** @03-architecture-agent  
**Next Task:** Design filtering logic with security constraints
```

---

## 🚦 VALIDATION GATES VIA GITHUB ACTIONS

### Automated Gate Checks

**File: `.github/workflows/gate-validation.yml`**

```yaml
name: Validation Gate

on:
  issue_comment:
    types: [created]

jobs:
  validate-gate:
    if: contains(github.event.comment.body, 'STAGE') && contains(github.event.comment.body, 'COMPLETE')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Parse Stage Number
        id: parse
        run: |
          STAGE=$(echo "${{ github.event.comment.body }}" | grep -oP 'STAGE \K\d+')
          echo "stage=$STAGE" >> $GITHUB_OUTPUT
      
      - name: Run Gate Validation
        run: |
          bash .github/scripts/gate-${{ steps.parse.outputs.stage }}-validation.sh
      
      - name: Update Issue on Success
        if: success()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ **GATE #${{ steps.parse.outputs.stage }} PASSED**\n\nAll validation checks successful. Pipeline may proceed to next stage.`
            })
            
            // Add label
            github.rest.issues.addLabels({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: [`gate-${{ steps.parse.outputs.stage }}-passed`]
            })
      
      - name: Block Pipeline on Failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `❌ **GATE #${{ steps.parse.outputs.stage }} FAILED**\n\nValidation checks failed. Pipeline BLOCKED until issues resolved.\n\nSee workflow logs for details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`
            })
            
            // Add blocking label
            github.rest.issues.addLabels({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: ['blocked', `gate-${{ steps.parse.outputs.stage }}-failed`]
            })
```

---

## 📊 MONITORING & DASHBOARDS

### Active Workflows Query

```bash
# List all active orchestrated workflows
gh issue list \
  --label "orchestrated-workflow" \
  --state open \
  --json number,title,assignees,labels,createdAt

# Example output:
# #42  [ORCHESTRATOR] Add Review Queue Filters  @05-api-agent  [stage-2-implementation]
# #43  [ORCHESTRATOR] Fix Program Deletion Bug   @09-code-review-agent  [stage-1-analysis]
```

### Workflow Progress Check

```bash
# View specific workflow
gh issue view 42

# Check validation gates
gh issue view 42 --json labels | jq '.labels[].name' | grep "gate-.*-passed"

# Output:
# gate-1-passed
# gate-2-passed
# (gate-3 pending)
```

### Blockers Report

```bash
# Find all blocked workflows
gh issue list \
  --label "blocked" \
  --state open \
  --json number,title,labels

# Example:
# #44  [ORCHESTRATOR] Optimize Review Query  [blocked, gate-3-failed]
```

---

## 🔄 FULL WORKFLOW EXAMPLE

### Complete Communication Flow

```
1. USER makes request:
   "Add pagination to Exercise Library"

2. ORCHESTRATOR analyzes:
   - Type: feature
   - Complexity: simple
   - Risk: low
   - Duration: 1-2h

3. ORCHESTRATOR creates issue #45:
   Title: [ORCHESTRATOR] Add Exercise Library Pagination
   Labels: orchestrated-workflow, complexity-simple, risk-low
   Assignee: @01-security-agent

4. GitHub Action triggers (issue created)
   - Runs initial validation
   - Checks prerequisites
   - Notifies assigned agent

5. SECURITY AGENT (@01-security-agent) analyzes:
   - Comments: "✅ STAGE 1 COMPLETE - Security approved"
   - Updates issue: Remove assignee, add label "stage-1-complete"

6. GitHub Action triggers (comment added)
   - Detects "STAGE 1 COMPLETE"
   - Runs Gate #1 validation script
   - Comments: "✅ GATE #1 PASSED"
   - Adds label: "gate-1-passed"

7. ORCHESTRATOR detects Gate #1 passed:
   - Assigns next agent: @05-api-agent
   - Comments: "Stage 2: Implementation - @05-api-agent"

8. API AGENT (@05-api-agent) implements:
   - Writes code (pagination logic)
   - Commits changes
   - Comments: "✅ STAGE 2 COMPLETE - Implementation done"

9. GitHub Action triggers (comment added)
   - Runs Gate #2 validation (build + tests)
   - TypeScript: ✅ 0 errors
   - Build: ✅ Success
   - Tests: ✅ All pass
   - Comments: "✅ GATE #2 PASSED"

10. ORCHESTRATOR continues pipeline...
    (Stages 3-4 with respective agents)

11. ORCHESTRATOR finalizes:
    - All gates passed
    - Creates PR #123
    - Links issue #45 to PR
    - Comments: "🎉 WORKFLOW COMPLETE"
    - Closes issue #45

12. GitHub Action triggers (issue closed)
    - Runs final metrics collection
    - Updates dashboard
    - Notifies user
```

---

## 🎯 BENEFITS OF GITHUB MCP INTEGRATION

### 1. Full Traceability

Every action logged in GitHub issue:
- Who did what
- When it happened
- What was the output
- What gates passed/failed

### 2. Asynchronous Coordination

Agents don't need to be online simultaneously:
- Agent A completes → Comments
- GitHub Actions validate
- Orchestrator assigns Agent B
- Agent B picks up when ready

### 3. Human Oversight

You can monitor in real-time:
- Open GitHub issue to see progress
- Intervene if needed (add comment)
- Force gate validation
- Manually assign agent if stuck

### 4. Automated Validation

GitHub Actions enforce quality:
- Gates run automatically
- No agent can bypass validation
- Pipeline blocked if checks fail
- Rollback triggered on failure

### 5. Historical Analysis

After completion:
- Full audit trail in issue
- Metrics collected (duration, gates, blockers)
- Patterns identified (common failures)
- Process improved over time

---

## 🚀 QUICK START CHECKLIST

- [ ] Install GitHub MCP Server (`go install github.com/github/github-mcp-server@latest`)
- [ ] Create GitHub Personal Access Token (scopes: repo, workflow)
- [ ] Configure `claude_desktop_config.json`
- [ ] Test MCP connection (`mcp_io_github_git_list_issues`)
- [ ] Copy validation scripts to `.github/scripts/`
- [ ] Add GitHub Actions workflow (`.github/workflows/gate-validation.yml`)
- [ ] Create first orchestrated issue manually (test)
- [ ] Verify agents can comment and update issue
- [ ] Verify gates run automatically
- [ ] Deploy to production workflow

---

## 📚 RESOURCES

- **GitHub MCP Docs:** https://github.com/github/github-mcp-server
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **GitHub GraphQL API:** https://docs.github.com/en/graphql
- **Workflow Orchestrator:** [00-workflow-orchestrator.md](./00-workflow-orchestrator.md)
- **Pipeline Reference:** [WORKFLOW_PIPELINE_REFERENCE.md](../WORKFLOW_PIPELINE_REFERENCE.md)

---

**Status:** Ready for implementation  
**Next Step:** Install GitHub MCP Server and configure authentication

This integration transforms your agents from isolated workers into a coordinated, validated, production-ready development pipeline. 🚀
