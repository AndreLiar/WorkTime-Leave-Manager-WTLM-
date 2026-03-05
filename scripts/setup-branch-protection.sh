#!/bin/bash

# Branch Protection Setup Script
# This script sets up branch protection rules for develop, staging, and main branches

set -e

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  BRANCH PROTECTION SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Repository: $REPO"
echo ""

# Function to set branch protection
protect_branch() {
    local BRANCH=$1
    local APPROVALS=$2
    local CHECKS=$3
    
    echo "📋 Protecting branch: $BRANCH"
    echo "   Required approvals: $APPROVALS"
    echo "   Status checks: $CHECKS"
    
    # Basic protection with required PR
    gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" \
        -f required_status_checks[strict]=true \
        -f required_status_checks[contexts][]="$CHECKS" \
        -f required_pull_request_reviews[required_approving_review_count]=$APPROVALS \
        -f required_pull_request_reviews[dismiss_stale_reviews]=true \
        -f required_pull_request_reviews[require_code_owner_reviews]=false \
        -F required_conversation_resolution=true \
        -F enforce_admins=true \
        -F allow_force_pushes=false \
        -F allow_deletions=false \
        -F required_linear_history=false \
        > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Successfully protected"
    else
        echo "   ⚠️  Protection may have failed - check manually"
    fi
    echo ""
}

# Protect develop branch
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
protect_branch "develop" 1 "ci-checks"

# Protect staging branch
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
protect_branch "staging" 1 "staging-validation"

# Protect main branch (with linear history)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Protecting branch: main"
echo "   Required approvals: 2"
echo "   Linear history: enforced"

gh api -X PUT "repos/$REPO/branches/main/protection" \
    -f required_status_checks[strict]=true \
    -f required_status_checks[contexts][]=main-pr-check \
    -f required_pull_request_reviews[required_approving_review_count]=2 \
    -f required_pull_request_reviews[dismiss_stale_reviews]=true \
    -f required_pull_request_reviews[require_code_owner_reviews]=false \
    -F required_conversation_resolution=true \
    -F enforce_admins=true \
    -F allow_force_pushes=false \
    -F allow_deletions=false \
    -F required_linear_history=true \
    -F block_creations=true \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Successfully protected"
else
    echo "   ⚠️  Protection may have failed - check manually"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BRANCH PROTECTION SETUP COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "   • develop: Protected (1 approval required)"
echo "   • staging: Protected (1 approval required)"
echo "   • main:    Protected (2 approvals required)"
echo ""
echo "⚠️  Note: Status checks will appear after first pipeline run"
echo ""
echo "🔍 Verify at: https://github.com/$REPO/settings/branches"
echo ""
