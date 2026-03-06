---
sidebar_position: 2
---

# Branch Strategy & Protection

## 🌲 Branch Structure

Our repository uses a **three-tier branch strategy** designed for progressive validation and safe production deployments.

```
feature/* branches
   │
   ├─ PR → develop (fast validation)
   │
develop branch
   │
   ├─ merge → staging (thorough testing)
   │
staging branch
   │
   ├─ PR → main (deployment ready)
   │
main branch
   │
   └─ deploy → Render Production
```

---

## 📋 Branch Details

### `feature/*` Branches

**Purpose:** Individual feature development

**Created from:** `develop`

**Naming convention:**
```bash
feature/add-notifications
feature/fix-login-bug
feature/improve-performance
```

**Lifetime:** Short-lived (1-3 days)

**Protection:** None (local development)

**Tests:** Run locally before PR

---

### `develop` Branch

**Purpose:** Active development integration point

**Receives PRs from:** `feature/*` branches

**Merges to:** `staging`

**Protection Level:** 🟡 Medium
- ✅ Require 1 approval
- ✅ Require CI checks to pass
- ✅ No direct pushes
- ✅ Conversation resolution

**CI Pipeline:** ~8-10 minutes
- TypeScript + ESLint
- Unit tests
- Build verification
- npm audit
- Gitleaks

**Philosophy:** Fast feedback for developers

---

### `staging` Branch

**Purpose:** Integration testing & production validation

**Receives merges from:** `develop`

**Merges to (via PR):** `main`

**Protection Level:** 🟠 High
- ✅ Require 1 approval
- ✅ Require full test suite
- ✅ Linear history enforced
- ✅ No direct pushes

**Validation Pipeline:** ~15-20 minutes
- Full build
- Integration tests (PostgreSQL)
- E2E tests (containerized)
- CodeQL SAST
- Trivy container scan
- Docker build validation

**Philosophy:** Thorough validation before production

**Note:** No deployment (validation branch only)

---

### `main` Branch

**Purpose:** Production-ready code that deploys automatically

**Receives PRs from:** `staging` only

**Deploys to:** Render Production

**Protection Level:** 🔴 Maximum
- ✅ Require 2 approvals
- ✅ Require all checks pass
- ✅ Linear history enforced
- ✅ No direct pushes
- ✅ No branch creation
- ✅ Signed commits (optional)

**PR Pipeline:** ~5 minutes
- Quick sanity tests
- Deployment readiness check

**CD Pipeline:** ~12-15 minutes
- Semantic versioning
- Docker build & push
- Render deployment
- Smoke tests

**Philosophy:** High confidence, automatic deployment

---

## 🛡️ Branch Protection Setup

### Prerequisites

- Repository owner/admin access
- GitHub account with proper permissions

### Option 1: Automated Setup (Recommended)

```bash
# From repository root
./scripts/setup-branch-protection.sh
```

This script will:
- ✅ Set up protection for `develop`
- ✅ Set up protection for `staging`
- ✅ Set up protection for `main`
- ✅ Configure approval requirements
- ✅ Enforce conversation resolution

### Option 2: Manual Setup (GitHub UI)

#### Step 1: Access Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in left sidebar
4. Click **Add rule**

#### Step 2: Protect `develop`

**Branch name pattern:** `develop`

**Settings to enable:**

```yaml
✅ Require a pull request before merging
   ├─ Require 1 approval
   ├─ Dismiss stale reviews when new commits are pushed
   └─ Require conversation resolution before merging

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date before merging
   └─ Status checks (will appear after first run):
      • ci-checks

✅ Do not allow bypassing the above settings
   └─ Include administrators

❌ Allow force pushes: Disabled
❌ Allow deletions: Disabled
```

Click **Create** or **Save changes**

#### Step 3: Protect `staging`

**Branch name pattern:** `staging`

**Settings to enable:**

```yaml
✅ Require a pull request before merging
   ├─ Require 1 approval
   ├─ Dismiss stale reviews when new commits are pushed
   └─ Require conversation resolution before merging

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date before merging
   └─ Status checks (will appear after first run):
      • staging-validation

✅ Require linear history

✅ Do not allow bypassing the above settings
   └─ Include administrators

❌ Allow force pushes: Disabled
❌ Allow deletions: Disabled
```

Click **Create** or **Save changes**

#### Step 4: Protect `main`

**Branch name pattern:** `main`

**Settings to enable:**

```yaml
✅ Require a pull request before merging
   ├─ Require 2 approvals
   ├─ Require review from Code Owners (optional)
   ├─ Dismiss stale reviews when new commits are pushed
   └─ Require conversation resolution before merging

✅ Require status checks to pass before merging
   ├─ Require branches to be up to date before merging
   └─ Status checks (will appear after first run):
      • main-pr-check

✅ Require linear history

✅ Require signed commits (optional but recommended)

✅ Block creations
   └─ Prevents direct commits

✅ Do not allow bypassing the above settings
   └─ Include administrators

❌ Allow force pushes: Disabled
❌ Allow deletions: Disabled
```

Click **Create** or **Save changes**

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Go to repository **Settings** → **Branches**
- [ ] See "Protected" badge next to `develop`
- [ ] See "Protected" badge next to `staging`
- [ ] See "Protected" badge next to `main`

### Test Protection

Try direct push (should fail):

```bash
git checkout develop
echo "test" >> README.md
git commit -am "test: direct push"
git push origin develop
```

**Expected result:**
```
remote: error: GH006: Protected branch update failed
! [remote rejected] develop -> develop (protected branch hook declined)
```

✅ **This is correct!** Protection is working.

---

## 🔧 Troubleshooting

### "Status check not found"

**Problem:** Status checks don't appear in protection settings

**Solution:**
1. Run the pipeline at least once
2. Wait for workflow to complete
3. Refresh branch protection page
4. Status checks should now appear in dropdown

### "Can't push to protected branch"

**Problem:** Direct push rejected

**Solution:**
✅ **This is expected behavior!**
- Use pull requests instead
- Follow the proper workflow:
  ```
  feature → develop (PR)
  develop → staging (merge)
  staging → main (PR)
  ```

### "Required approvals not met"

**Problem:** Can't merge PR

**Solution:**
1. Request review from team member
2. Wait for approval(s):
   - `develop`: Need 1 approval
   - `staging`: Need 1 approval
   - `main`: Need 2 approvals
3. Merge after approval

### "Stale review dismissed"

**Problem:** Approval removed after new push

**Solution:**
✅ **This is a feature!**
- Ensures reviewers see latest changes
- Request re-approval after fixes
- Prevents merging unreviewed code

---

## 📊 Protection Summary

| Branch | Approvals | Status Checks | Linear History | Direct Push |
|--------|-----------|---------------|----------------|-------------|
| **develop** | 1 | Required | No | ❌ Blocked |
| **staging** | 1 | Required | ✅ Yes | ❌ Blocked |
| **main** | 2 | Required | ✅ Yes | ❌ Blocked |

---

## 🎯 Best Practices

### For Developers

1. **Never push directly** to protected branches
2. **Always use PRs** for code review
3. **Keep PRs small** (< 300 lines)
4. **Write clear** PR descriptions
5. **Respond to** review comments promptly

### For Reviewers

1. **Review within 24 hours** when possible
2. **Be constructive** in comments
3. **Ask questions** if unclear
4. **Approve when satisfied** (don't block unnecessarily)
5. **Request changes** if needed

### For Team

1. **Respect the process** - no bypassing
2. **Merge regularly** to avoid conflicts
3. **Communicate** about blocked PRs
4. **Document decisions** in PR comments
5. **Learn from failures** in retrospectives

---

## 🚨 Emergency Procedures

### Production is Broken

**Don't panic!** Follow rollback procedure:

1. Go to **Actions** → **CD Pipeline**
2. Click **Run workflow**
3. Select **rollback** action
4. Enter previous working version
5. Provide reason: "Production incident"
6. Click **Run workflow**

**Rollback time:** ~10 minutes

**See:** [Deployment & Rollback Guide](./deployment)

### Hotfix Needed Urgently

**Process:**

```bash
# Create hotfix from main
git checkout -b hotfix/critical-bug main

# Fix the issue
# ... make changes ...

# Push and create PR to main
git push origin hotfix/critical-bug

# Get emergency approvals (2 required)
# Merge and deploy automatically
```

**Note:** Update `develop` and `staging` after hotfix!

---

## 📚 Related Documentation

- [Overview](./overview) - CI/CD introduction
- [Developer Workflow](./developer-workflow) - Daily usage
- [Pipeline Details](./pipeline-details) - Technical configuration
- [Deployment](./deployment) - Production deployment

---

## 💡 Why These Rules?

### 1 Approval for develop/staging
- **Reason:** Fast feedback for team
- **Benefit:** Doesn't slow down development
- **Risk:** Low (not production)

### 2 Approvals for main
- **Reason:** Extra safety for production
- **Benefit:** Multiple people verify changes
- **Risk:** High (affects users)

### Linear History
- **Reason:** Clean, traceable history
- **Benefit:** Easy to understand changes
- **Risk:** None (just merge commits)

### No Direct Pushes
- **Reason:** Force code review
- **Benefit:** Catch bugs early
- **Risk:** Quality without review

---

## ✅ Ready to Continue

**Next steps:**
1. ✅ Verify branch protection is set up
2. ✅ Test with a feature PR
3. ✅ Read [Developer Workflow](./developer-workflow)
4. ✅ Learn [Pipeline Details](./pipeline-details)
