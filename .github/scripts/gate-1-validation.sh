#!/bin/bash
# Gate #1: Pre-Implementation Validation
# Ensures security, architecture, and database planning are approved before implementation

set -e

echo "🚦 GATE #1: Pre-Implementation Validation"
echo "=========================================="

ISSUE_NUMBER=$1
STAGE_OUTPUT=$2

if [ -z "$ISSUE_NUMBER" ]; then
  echo "❌ Error: Issue number required"
  exit 1
fi

# Parse stage output from GitHub issue comment
SECURITY_APPROVED=$(echo "$STAGE_OUTPUT" | grep -i "security.*approved" || echo "")
ARCHITECTURE_SOUND=$(echo "$STAGE_OUTPUT" | grep -i "architecture.*sound\|design.*approved" || echo "")
DATABASE_PLANNED=$(echo "$STAGE_OUTPUT" | grep -i "database.*migration\|schema.*planned" || echo "")
MULTI_TENANCY_OK=$(echo "$STAGE_OUTPUT" | grep -i "multi-tenancy.*validated\|tenant.*isolation" || echo "")

FAILED=0

echo ""
echo "📋 Checklist:"
echo "-------------"

# Check 1: Security Pre-Approval
if [ -n "$SECURITY_APPROVED" ]; then
  echo "✅ Security pre-check approved"
else
  echo "❌ Security pre-check NOT approved"
  FAILED=1
fi

# Check 2: Architecture Validation
if [ -n "$ARCHITECTURE_SOUND" ]; then
  echo "✅ Architecture design sound"
else
  echo "❌ Architecture design NOT validated"
  FAILED=1
fi

# Check 3: Database Migration Plan
if [ -n "$DATABASE_PLANNED" ]; then
  echo "✅ Database migration plan exists"
else
  echo "⚠️  Database migration plan not mentioned (may not be needed)"
fi

# Check 4: Multi-tenancy Validation (CRITICAL for SaaS)
if [ -n "$MULTI_TENANCY_OK" ]; then
  echo "✅ Multi-tenancy validated"
else
  echo "❌ Multi-tenancy NOT validated (CRITICAL for SaaS)"
  FAILED=1
fi

echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ GATE #1 PASSED - Ready for implementation"
  exit 0
else
  echo "❌ GATE #1 FAILED - Implementation BLOCKED"
  echo ""
  echo "🔒 BLOCKER: Stage 1 approval incomplete"
  echo "Required: Security approval + Architecture validation + Multi-tenancy check"
  exit 1
fi
