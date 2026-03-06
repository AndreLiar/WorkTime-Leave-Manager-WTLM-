---
sidebar_position: 3
---

# Developer Workflow

## 🚀 Daily Workflow

This guide covers the complete developer workflow from creating a feature to deploying it to production.

---

## 📋 Step-by-Step Guide

### Step 1: Start a New Feature

```bash
# Ensure you're on latest develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/add-email-notifications

# Verify branch
git branch
# * feature/add-email-notifications
```

**Naming conventions:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation updates

---

### Step 2: Develop Locally

```bash
# Make your changes
# Edit files...

# Run tests locally (important!)
npm run lint          # Check code style
npm run ts            # TypeScript check
npm run test          # Run unit tests
npm run build         # Verify it builds

# Commit changes
git add .
git commit -m "feat: add email notification service"
```

**Commit message format:**
```
type: description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

---

### Step 3: Push Feature Branch

```bash
# Push to GitHub
git push origin feature/add-email-notifications

# If first push
git push -u origin feature/add-email-notifications
```

**Output:**
```
Enumerating objects: 5, done.
Writing objects: 100% (3/3), 289 bytes | 289.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To github.com:YourOrg/WorkTime-Leave-Manager-WTLM-.git
 * [new branch]  feature/add-email-notifications -> feature/add-email-notifications
```

---

### Step 4: Open Pull Request to Develop

1. **Go to GitHub repository**
2. **Click "Pull requests" tab**
3. **Click "New pull request"**
4. **Set base:** `develop` ← **head:** `feature/add-email-notifications`
5. **Fill in PR template:**

```markdown
## Description
Adds email notification service for leave request updates

## Changes
- Created EmailService
- Added email templates
- Integrated with leave request workflow
- Added unit tests

## Testing
- ✅ Unit tests pass locally
- ✅ Build successful
- ✅ Lint checks pass

## Screenshots (if UI changes)
[Add screenshots here]

## Checklist
- [x] Code follows style guidelines
- [x] Tests added/updated
- [x] Documentation updated
- [x] No breaking changes
```

6. **Click "Create pull request"**

---

### Step 5: CI Pipeline Runs (8-10 min)

**Automatically triggered by PR creation**

Watch the pipeline in the PR:

```
CI Checks
├─ 🔍 TypeScript check      ✅ Passed
├─ 🎨 ESLint               ✅ Passed
├─ 🧪 Unit tests           ✅ Passed (95% coverage)
├─ 🏗️ Build                ✅ Passed
├─ 🔒 npm audit            ✅ Passed (0 vulnerabilities)
└─ 🔐 Gitleaks             ✅ Passed (no secrets)
```

**PR Comment appears:**

```markdown
## ✅ CI Pipeline Results

**Target branch:** `develop`
**Status:** success

### Checks Performed:
- ✅ TypeScript validation
- ✅ ESLint checks
- ✅ Unit tests (95% coverage)
- ✅ Build verification
- ✅ npm audit
- ✅ Gitleaks

---
✅ **All checks passed!** Ready for review.
```

---

### Step 6: Address CI Failures (if any)

If CI fails:

#### TypeScript Errors

```bash
# Check TypeScript errors
npm run ts

# Fix errors
# ... edit files ...

# Commit and push
git add .
git commit -m "fix: resolve TypeScript errors"
git push
```

#### Lint Errors

```bash
# Check lint errors
npm run lint

# Auto-fix what you can
npm run lint -- --fix

# Commit fixes
git add .
git commit -m "style: fix linting issues"
git push
```

#### Test Failures

```bash
# Run specific test
npm test -- src/modules/email/email.service.spec.ts

# Fix the test or code
# ... edit files ...

# Commit
git add .
git commit -m "test: fix email service tests"
git push
```

**CI automatically re-runs on new push!**

---

### Step 7: Request Review

Once CI passes:

1. **Click "Reviewers"** in right sidebar
2. **Select team member(s)**
3. **Add comment (optional):**
   ```
   @teammate Ready for review! 
   
   Main changes are in EmailService.
   Let me know if you have questions.
   ```

**Slack/Teams (optional):**
```
Hey @teammate, can you review my PR?
https://github.com/YourOrg/repo/pull/123
```

---

### Step 8: Address Review Comments

Reviewer leaves comments:

```markdown
**File:** src/modules/email/email.service.ts

"Should we add retry logic for failed emails?"
```

**Your response:**

```markdown
Good catch! Added retry logic with exponential backoff.
See commit abc123.
```

**Make changes:**

```bash
# Implement feedback
# ... edit files ...

# Commit
git add .
git commit -m "feat: add email retry logic"
git push
```

**CI runs again automatically**

**Request re-review if needed**

---

### Step 9: Get Approval & Merge

**Reviewer approves:**

```markdown
✅ @reviewer approved these changes
"LGTM! Nice implementation of retry logic."
```

**Merge options:**

1. **Squash and merge** (recommended)
   - Combines all commits into one
   - Clean history

2. **Rebase and merge**
   - Keeps individual commits
   - Linear history

3. **Merge commit**
   - Creates merge commit
   - Not recommended (violates linear history on staging/main)

**Click "Squash and merge"**

**Edit merge commit message:**

```
feat: add email notification service

- Created EmailService with retry logic
- Added email templates
- Integrated with leave request workflow
- Added comprehensive unit tests

PR: #123
```

**Click "Confirm squash and merge"**

✅ **Feature merged to develop!**

---

### Step 10: Clean Up

```bash
# Switch back to develop
git checkout develop

# Pull latest (includes your feature)
git pull origin develop

# Delete local feature branch
git branch -d feature/add-email-notifications

# Delete remote branch (done automatically by GitHub if enabled)
# Or manually:
git push origin --delete feature/add-email-notifications
```

---

## 🔄 Promoting to Staging

**When ready to test in staging environment:**

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Merge to staging
git checkout staging
git pull origin staging
git merge develop

# Push to staging
git push origin staging
```

**This triggers the Staging Validation Pipeline (~15-20 min):**

```
Staging Validation
├─ 🏗️ Full build              ✅ Passed
├─ 🔗 Integration tests      ✅ Passed (10/10)
├─ 🧪 E2E tests              ✅ Passed (25/25)
├─ 🔒 CodeQL SAST            ✅ Passed (0 vulnerabilities)
├─ 🐳 Trivy container scan   ✅ Passed (0 critical CVEs)
└─ 📦 Docker build           ✅ Passed
```

**Watch progress in Actions tab**

---

## 🚀 Deploying to Production

**When staging is validated and ready:**

### Step 1: Create PR from Staging to Main

1. **Go to GitHub**
2. **New pull request**
3. **Base:** `main` ← **Compare:** `staging`
4. **Fill in deployment notes:**

```markdown
## 🚀 Production Deployment

### Features Included
- Email notification service
- Dashboard performance improvements
- Bug fix: Leave request approval flow

### Database Changes
- None (or list migrations)

### Rollback Plan
- Revert to version: 2026.03.05-abc1234
- No data migration needed

### Testing
- ✅ All staging tests passed
- ✅ Integration tests: 10/10
- ✅ E2E tests: 25/25
- ✅ Security scans: Clear

### Checklist
- [x] Staging validation complete
- [x] Database migrations ready
- [x] Rollback plan documented
- [x] Team notified
```

5. **Click "Create pull request"**

### Step 2: Get 2 Approvals

**Main requires 2 approvals** (higher bar for production)

**Request reviews from:**
- Technical lead
- Another senior developer

**Main PR Pipeline runs (~5 min):**
```
Main PR Check
├─ ⚡ Sanity tests          ✅ Passed
└─ 🔍 Deployment readiness  ✅ Passed
```

### Step 3: Merge and Deploy

**After 2 approvals and checks pass:**

**Click "Squash and merge"**

**✅ Automatic deployment triggered!**

**CD Pipeline runs (~12-15 min):**

```
Production Deployment
├─ 📌 Version: 2026.03.05-def4567
├─ 🐳 Docker build          ✅ Complete
├─ 📤 Push to GHCR          ✅ Complete
├─ 🚀 Deploy to Render      ✅ Live
├─ 🏥 Health check          ✅ Passed
├─ 🧪 Smoke test: Root      ✅ Passed
├─ 🧪 Smoke test: API       ✅ Passed
└─ ✅ Deployment successful!
```

**🎉 Your feature is live in production!**

---

## 📊 Typical Timeline

| Activity | Time | Actor |
|----------|------|-------|
| Local development | 2-4 hours | You |
| Create feature branch | 1 min | You |
| Open PR to develop | 1 min | You |
| CI pipeline | 8-10 min | Automated |
| Code review | 1-4 hours | Teammate |
| Address feedback | 30 min | You |
| Merge to develop | 1 min | You |
| Merge to staging | 5 min | You |
| Staging validation | 15-20 min | Automated |
| PR to main | 2 min | You |
| Get 2 approvals | 2-8 hours | Team |
| Deploy to production | 12-15 min | Automated |
| **Total** | **1-2 days** | |

---

## 🎯 Best Practices

### Before Opening PR

✅ **Run checks locally:**
```bash
npm run lint
npm run ts
npm test
npm run build
```

✅ **Keep PRs small:** < 300 lines

✅ **Write tests:** Cover new code

✅ **Update docs:** If needed

### During Review

✅ **Respond promptly:** Within 24 hours

✅ **Be open:** To feedback

✅ **Explain decisions:** In comments

✅ **Update PR:** Based on feedback

### After Merge

✅ **Clean up:** Delete feature branch

✅ **Update tickets:** Mark as done

✅ **Monitor:** Check CI passes

✅ **Verify:** Feature works in staging

---

## 🚨 Common Issues

### "CI is taking too long"

**Normal times:**
- Develop PR: 8-10 min ✅
- Staging: 15-20 min ✅
- Production: 12-15 min ✅

**If longer:** Check Actions tab for issues

### "Merge conflict"

```bash
# Update your branch with latest develop
git checkout feature/your-feature
git fetch origin
git merge origin/develop

# Resolve conflicts
# ... edit conflicting files ...

# Commit resolution
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### "Test failed in CI but passes locally"

**Common causes:**
- Different Node version
- Missing environment variables
- Database state differences

**Solution:** Check Actions logs for exact error

### "Forgot to pull before creating branch"

```bash
# Rebase on latest develop
git fetch origin
git rebase origin/develop

# May need to resolve conflicts
# Then force push (safe on feature branches)
git push --force-with-lease
```

---

## 📚 Related Documentation

- [Branch Strategy](./branch-strategy) - Protection rules
- [Pipeline Details](./pipeline-details) - Technical config
- [Deployment](./deployment) - Production deployment
- [Troubleshooting](./troubleshooting) - Common issues

---

## ✅ Quick Reference Card

```bash
# Start feature
git checkout develop
git pull
git checkout -b feature/name

# Develop
# ... make changes ...
npm run lint && npm test && npm run build

# Push & PR
git push -u origin feature/name
# Open PR on GitHub → develop

# After approval, merge to staging
git checkout staging
git merge develop
git push

# After staging validation, PR to main
# Get 2 approvals
# Merge → Auto-deploy! 🚀
```

**Remember:** Always use pull requests, never push directly to protected branches!
