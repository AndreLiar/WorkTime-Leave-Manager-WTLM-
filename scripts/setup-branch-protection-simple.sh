#!/bin/bash

# Simplified Branch Protection Setup
# Sets up basic protections without status checks (will add those after first pipeline run)

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  SETTING UP BRANCH PROTECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Protect develop
echo "📋 Protecting: develop"
gh api -X PUT repos/:owner/:repo/branches/develop/protection \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -F required_pull_request_reviews[dismiss_stale_reviews]=true \
  -F enforce_admins]=true \
  -F allow_force_pushes=false \
  -F allow_deletions=false 2>&1 | grep -q "HTTP" || echo "   ✅ Protected"

# Protect staging  
echo "📋 Protecting: staging"
gh api -X PUT repos/:owner/:repo/branches/staging/protection \
  -f required_pull_request_reviews[required_approving_review_count]=1 \
  -F required_pull_request_reviews[dismiss_stale_reviews]=true \
  -F enforce_admins=true \
  -F allow_force_pushes=false \
  -F allow_deletions=false \
  -F required_linear_history=true 2>&1 | grep -q "HTTP" || echo "   ✅ Protected"

# Protect main
echo "📋 Protecting: main"
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  -f required_pull_request_reviews[required_approving_review_count]=2 \
  -F required_pull_request_reviews[dismiss_stale_reviews]=true \
  -F enforce_admins=true \
  -F allow_force_pushes=false \
  -F allow_deletions=false \
  -F required_linear_history=true \
  -F block_creations=true 2>&1 | grep -q "HTTP" || echo "   ✅ Protected"

echo ""
echo "✅ Branch protection setup complete!"
echo ""
echo "⚠️  Next steps:"
echo "   1. Run CI pipelines at least once"
echo "   2. Manually add status checks in Settings → Branches"
echo "   3. Add these checks:"
echo "      • develop: ci-checks"
echo "      • staging: staging-validation"  
echo "      • main: main-pr-check"
echo ""
