#!/bin/bash
# Gate #4: Documentation & Final Review
# Ensures documentation is updated and code review is complete

set -e

echo "🚦 GATE #4: Documentation & Final Review"
echo "========================================="

ISSUE_NUMBER=$1
STAGE_OUTPUT=$2

if [ -z "$ISSUE_NUMBER" ]; then
  echo "❌ Error: Issue number required"
  exit 1
fi

FAILED=0

echo ""
echo "📋 Checklist:"
echo "-------------"

# Check 1: Documentation Updated
DOCS_UPDATED=$(echo "$STAGE_OUTPUT" | grep -i "documentation.*updated\|docs.*complete" || echo "")
if [ -n "$DOCS_UPDATED" ]; then
  echo "✅ Documentation updated"
else
  echo "❌ Documentation NOT updated"
  FAILED=1
fi

# Check 2: Code Review Approved
CODE_REVIEW=$(echo "$STAGE_OUTPUT" | grep -i "code review.*approved\|review.*complete" || echo "")
if [ -n "$CODE_REVIEW" ]; then
  echo "✅ Code review approved"
else
  echo "❌ Code review NOT approved"
  FAILED=1
fi

# Check 3: Migration Guide (if database changes)
MIGRATION_GUIDE=$(echo "$STAGE_OUTPUT" | grep -i "migration.*guide\|rollback.*plan" || echo "")
if [ -n "$MIGRATION_GUIDE" ]; then
  echo "✅ Migration guide documented"
else
  echo "⚠️  Migration guide not mentioned (may not be needed)"
fi

# Check 4: Rollback Plan
ROLLBACK_PLAN=$(echo "$STAGE_OUTPUT" | grep -i "rollback.*plan\|rollback.*documented" || echo "")
if [ -n "$ROLLBACK_PLAN" ]; then
  echo "✅ Rollback plan documented"
else
  echo "⚠️  Rollback plan not mentioned"
fi

# Check 5: Pull Request exists
echo ""
echo "🔍 Checking for Pull Request..."
# This check will be done by GitHub Actions workflow (checking PR linked to issue)
echo "⏭️  PR validation handled by GitHub Actions"

echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ GATE #4 PASSED - Ready for merge"
  exit 0
else
  echo "❌ GATE #4 FAILED - Final review incomplete"
  echo ""
  echo "🔒 BLOCKER: Complete documentation and code review"
  exit 1
fi
