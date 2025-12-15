# Gate #4: Final Deployment Validation
# This gate MUST pass before any deployment to production
# Runs comprehensive E2E tests + final security checks

$ErrorActionPreference = "Stop"

$PASSED = 0
$FAILED = 0
$WARNINGS = 0

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🚀 GATE #4: FINAL DEPLOYMENT VALIDATION"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

Set-Location backend

# Check if test environment is set up
if (-not (Test-Path ".env.test")) {
    Write-Host "⚠️  Creating test environment file..." -ForegroundColor Yellow
    @"
DATABASE_URL="postgresql://testuser:testpassword@localhost:5432/gobeyondfit_test?schema=public"
JWT_SECRET="test-jwt-secret-do-not-use-in-production-12345"
NODE_ENV="test"
PORT=3001
"@ | Out-File -FilePath ".env.test" -Encoding UTF8
}

$START_TIME = Get-Date

###############################################################################
# STEP 1: Security E2E Tests (CRITICAL - MUST PASS)
###############################################################################
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔒 STEP 1/4: Running Security E2E Tests (CRITICAL)"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

try {
    npm run test:e2e -- e2e-security.e2e-spec.ts --forceExit --detectOpenHandles --silent
    Write-Host "✅ Security Tests PASSED" -ForegroundColor Green
    $PASSED++
} catch {
    Write-Host "❌ Security Tests FAILED" -ForegroundColor Red
    Write-Host "🚨 CRITICAL: Security vulnerabilities detected!" -ForegroundColor Red
    Write-Host "🚨 DEPLOYMENT BLOCKED" -ForegroundColor Red
    $FAILED++
    exit 1
}

Write-Host ""

###############################################################################
# STEP 2: Performance E2E Tests (CRITICAL - MUST PASS)
###############################################################################
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "⚡ STEP 2/4: Running Performance E2E Tests (CRITICAL)"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

try {
    npm run test:e2e -- e2e-performance.e2e-spec.ts --forceExit --detectOpenHandles --silent
    Write-Host "✅ Performance Tests PASSED" -ForegroundColor Green
    $PASSED++
} catch {
    Write-Host "❌ Performance Tests FAILED" -ForegroundColor Red
    Write-Host "⚠️  Performance benchmarks not met" -ForegroundColor Yellow
    $FAILED++
    exit 1
}

Write-Host ""

###############################################################################
# STEP 3: Workflow E2E Tests
###############################################################################
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔄 STEP 3/4: Running Workflow E2E Tests"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

try {
    npm run test:e2e -- e2e-workflow.e2e-spec.ts --forceExit --detectOpenHandles --silent
    Write-Host "✅ Workflow Tests PASSED" -ForegroundColor Green
    $PASSED++
} catch {
    Write-Host "❌ Workflow Tests FAILED" -ForegroundColor Red
    Write-Host "⚠️  User workflows broken" -ForegroundColor Yellow
    $FAILED++
    exit 1
}

Write-Host ""

###############################################################################
# STEP 4: Review Queue E2E Tests
###############################################################################
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📋 STEP 4/4: Running Review Queue E2E Tests"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

try {
    npm run test:e2e -- e2e-review-queue.e2e-spec.ts --forceExit --detectOpenHandles --silent
    Write-Host "✅ Review Queue Tests PASSED" -ForegroundColor Green
    $PASSED++
} catch {
    Write-Host "❌ Review Queue Tests FAILED" -ForegroundColor Red
    Write-Host "⚠️  Coach workflows broken" -ForegroundColor Yellow
    $FAILED++
    exit 1
}

Write-Host ""

###############################################################################
# STEP 5: Calculate Total Time
###############################################################################
$END_TIME = Get-Date
$DURATION = ($END_TIME - $START_TIME).TotalSeconds
$MINUTES = [Math]::Floor($DURATION / 60)
$SECONDS = [Math]::Floor($DURATION % 60)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📊 GATE #4 SUMMARY"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "Test Suites:"
Write-Host "  Passed:   $PASSED" -ForegroundColor Green
Write-Host "  Failed:   $FAILED" -ForegroundColor Red
Write-Host "  Warnings: $WARNINGS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Execution Time: ${MINUTES}m ${SECONDS}s"
Write-Host ""

# Check time limit (5 minutes)
if ($DURATION -gt 300) {
    Write-Host "⚠️  WARNING: Tests took longer than 5 minutes" -ForegroundColor Yellow
    $WARNINGS++
}

###############################################################################
# STEP 6: Generate Test Report
###############################################################################
$REPORT_FILE = "gate-4-report.json"
$TIMESTAMP = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ" -AsUTC

$STATUS = if ($FAILED -eq 0) { "PASSED" } else { "FAILED" }

$REPORT = @{
    gate = "4"
    name = "Final Deployment Validation"
    timestamp = $TIMESTAMP
    duration = [int]$DURATION
    results = @{
        security = if ($PASSED -ge 1) { "PASSED" } else { "FAILED" }
        performance = if ($PASSED -ge 2) { "PASSED" } else { "FAILED" }
        workflow = if ($PASSED -ge 3) { "PASSED" } else { "FAILED" }
        reviewQueue = if ($PASSED -ge 4) { "PASSED" } else { "FAILED" }
    }
    summary = @{
        passed = $PASSED
        failed = $FAILED
        warnings = $WARNINGS
        status = $STATUS
    }
} | ConvertTo-Json -Depth 10

$REPORT | Out-File -FilePath $REPORT_FILE -Encoding UTF8

Write-Host "📄 Test report saved to: $REPORT_FILE"
Write-Host ""

###############################################################################
# FINAL RESULT
###############################################################################
if ($FAILED -eq 0) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "✅ GATE #4 PASSED" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "🎉 All E2E tests passed!"
    Write-Host "🚀 Ready for deployment!"
    Write-Host ""
    
    if ($WARNINGS -gt 0) {
        Write-Host "⚠️  Note: $WARNINGS warnings detected" -ForegroundColor Yellow
        Write-Host ""
    }
    
    exit 0
} else {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "❌ GATE #4 FAILED" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "🚨 DEPLOYMENT BLOCKED" -ForegroundColor Red
    Write-Host "🚨 Fix failures before deploying to production" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed Tests: $FAILED"
    Write-Host ""
    
    exit 1
}
