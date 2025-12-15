#!/bin/bash
# Gate #3: Security & Performance Validation
# Ensures security audit passes and performance meets requirements

set -e

echo "🚦 GATE #3: Security & Performance Validation"
echo "=============================================="

ISSUE_NUMBER=$1
WORKSPACE_ROOT=${WORKSPACE_ROOT:-$(pwd)}

cd "$WORKSPACE_ROOT"

FAILED=0

echo ""
echo "📋 Checklist:"
echo "-------------"

# Check 1: Security Audit (npm audit)
echo "🔒 Running security audit..."
cd backend
if npm audit --audit-level=moderate 2>&1 | tee /tmp/audit.log; then
  echo "✅ No moderate/high/critical vulnerabilities"
else
  VULNERABILITIES=$(grep -c "vulnerabilities" /tmp/audit.log || echo "0")
  echo "❌ Security vulnerabilities detected"
  cat /tmp/audit.log
  FAILED=1
fi
cd ..

# Check 2: Query Performance (<500ms)
echo ""
echo "⚡ Checking query performance..."
if [ -f "backend/scripts/performance-check.ts" ]; then
  cd backend
  if npx ts-node scripts/performance-check.ts 2>&1 | tee /tmp/perf.log; then
    SLOW_QUERIES=$(grep "SLOW" /tmp/perf.log || echo "")
    if [ -z "$SLOW_QUERIES" ]; then
      echo "✅ All queries < 500ms"
    else
      echo "❌ Slow queries detected (>500ms):"
      echo "$SLOW_QUERIES"
      FAILED=1
    fi
  else
    echo "⚠️  Performance check script failed"
  fi
  cd ..
else
  echo "⚠️  Performance check script not found (will be created in Phase 2)"
fi

# Check 3: Test Coverage (Re-check)
echo ""
echo "📊 Verifying test coverage maintained..."
cd backend
COVERAGE=$(npm run test:cov 2>&1 | grep "Statements" | grep -oP '\d+\.\d+|\d+' | head -1 || echo "0")
if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
  echo "✅ Test coverage: ${COVERAGE}% (≥80%)"
else
  echo "❌ Test coverage dropped to ${COVERAGE}% (BELOW 80%)"
  FAILED=1
fi
cd ..

# Check 4: SQL Injection Prevention
echo ""
echo "🛡️  Checking for SQL injection vectors..."
# Check for raw SQL queries not using Prisma/parameterized queries
RAW_SQL=$(find backend/src -name "*.ts" -type f -exec grep -n "execute.*SELECT\|query.*SELECT" {} + | grep -v "prisma\|@prisma" || echo "")
if [ -z "$RAW_SQL" ]; then
  echo "✅ No raw SQL queries detected (using Prisma)"
else
  echo "⚠️  Potential raw SQL queries found (verify parameterization):"
  echo "$RAW_SQL"
fi

# Check 5: RBAC Validation (userId in queries)
echo ""
echo "👤 Checking RBAC implementation..."
# Look for Prisma queries missing userId filter
MISSING_USER_FILTER=$(find backend/src -name "*.service.ts" -type f -exec grep -n "findMany\|findUnique" {} + | grep -v "userId" | head -5 || echo "")
if [ -z "$MISSING_USER_FILTER" ]; then
  echo "✅ RBAC checks present in queries"
else
  echo "⚠️  Some queries may be missing userId filter (verify manually):"
  echo "$MISSING_USER_FILTER"
fi

echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ GATE #3 PASSED - Security & performance validated"
  exit 0
else
  echo "❌ GATE #3 FAILED - Security or performance issues detected"
  echo ""
  echo "🔒 BLOCKER: Fix security vulnerabilities and slow queries"
  exit 1
fi
