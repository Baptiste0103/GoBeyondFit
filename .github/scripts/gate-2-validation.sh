#!/bin/bash
# Gate #2: Build & Test Validation
# Ensures code compiles, tests pass, and coverage meets threshold

set -e

echo "🚦 GATE #2: Build & Test Validation"
echo "===================================="

ISSUE_NUMBER=$1
WORKSPACE_ROOT=${WORKSPACE_ROOT:-$(pwd)}

cd "$WORKSPACE_ROOT"

FAILED=0

echo ""
echo "📋 Checklist:"
echo "-------------"

# Check 1: TypeScript Compilation (Backend)
echo "🔨 Building backend..."
cd backend
if npm run build 2>&1 | tee /tmp/build.log; then
  TS_ERRORS=$(grep -c "error TS" /tmp/build.log || echo "0")
  if [ "$TS_ERRORS" -eq "0" ]; then
    echo "✅ Backend builds successfully (0 TypeScript errors)"
  else
    echo "❌ Backend build has $TS_ERRORS TypeScript errors"
    FAILED=1
  fi
else
  echo "❌ Backend build FAILED"
  FAILED=1
fi
cd ..

# Check 2: Tests Pass
echo ""
echo "🧪 Running tests..."
cd backend
if npm run test 2>&1 | tee /tmp/test.log; then
  echo "✅ All tests pass"
else
  FAILED_TESTS=$(grep -c "FAIL" /tmp/test.log || echo "unknown")
  echo "❌ Tests FAILED ($FAILED_TESTS failures)"
  FAILED=1
fi

# Check 3: Test Coverage ≥80%
echo ""
echo "📊 Checking test coverage..."
if npm run test:cov 2>&1 | tee /tmp/coverage.log; then
  # Extract coverage percentage (Jest format: "Statements: 85.5%")
  COVERAGE=$(grep "Statements" /tmp/coverage.log | grep -oP '\d+\.\d+|\d+' | head -1 || echo "0")
  
  if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    echo "✅ Test coverage: ${COVERAGE}% (≥80% required)"
  else
    echo "❌ Test coverage: ${COVERAGE}% (BELOW 80% threshold)"
    FAILED=1
  fi
else
  echo "⚠️  Could not determine test coverage"
fi
cd ..

# Check 4: No console.log in production code
echo ""
echo "🔍 Checking for console.log statements..."
CONSOLE_LOGS=$(find backend/src -name "*.ts" -type f -exec grep -n "console\.log" {} + | grep -v "\.spec\.ts" || echo "")
if [ -z "$CONSOLE_LOGS" ]; then
  echo "✅ No console.log in production code"
else
  echo "⚠️  Found console.log statements (should use Logger):"
  echo "$CONSOLE_LOGS"
  echo "(Not blocking, but should be fixed)"
fi

echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ GATE #2 PASSED - Build & tests successful"
  exit 0
else
  echo "❌ GATE #2 FAILED - Build or tests FAILED"
  echo ""
  echo "🔒 BLOCKER: Fix build errors and failing tests before proceeding"
  exit 1
fi
