# CI/CD Guide for Small Teams

## 🎯 Philosophy

This CI/CD setup is **comprehensive with security-first approach**:
- ✅ **Security scanning** (SAST, container, dependencies)
- ✅ **Fast feedback** (~10-15 minutes)
- ✅ **Simple to understand** (single CI file)
- ✅ **Production-ready** (enterprise-grade security)
- ✅ **Practical approach** (balanced speed & security)

---

## 📋 Pipeline Overview

### **1. CI Pipeline** (All Pull Requests)

**File:** `.github/workflows/ci.yml`

**Triggers:**
- PRs to `main`, `dev`, or `develop`
- Every commit pushed to open PR

**What It Does:**

```
1. Code Quality (1 min)
   ├─ TypeScript check
   └─ ESLint

2. Unit Tests (2 min)
   └─ All test suites

3. Build (1 min)
   └─ TypeScript compilation

4. Security Scans (5-7 min)
   ├─ npm audit (dependency vulnerabilities)
   ├─ Snyk scan (advanced dependency analysis)  
   ├─ CodeQL SAST (SQL injection, XSS, etc.)
   ├─ Build Docker image
   └─ Trivy container scan (OS/library CVEs)

5. Integration Tests (3 min) - only for dev PRs
   ├─ Start PostgreSQL
   ├─ Run migrations
   ├─ Start app
   └─ Newman/Postman tests

6. PR Comment
   └─ Auto-post summary with security findings
```

**Total Time:** 10-15 minutes depending on target branch

---

### **2. CD Pipeline** (Production Deployment)

**File:** `.github/workflows/cd.yml`

**Triggers:**
- Push to `main` branch

**What It Does:**

```
1. Version Tagging (10 sec)
   └─ Create tag: YYYY.MM.DD-{sha}

2. Docker Build (3-5 min)
   └─ Build & push to GHCR

3. Deploy to Render (5-10 min)
   └─ Trigger & monitor

4. Smoke Tests (30 sec)
   ├─ Health check
   ├─ API endpoints
   └─ Statistics

5. Success/Fail notification
```

**Total Time:** 10-15 minutes

---

### **3. Rollback Workflow** (Manual)

**File:** `.github/workflows/rollback.yml`

**Trigger:** Manual via GitHub UI

**Usage:**
```bash
Actions → Rollback Deployment → Run workflow
  Version: 2026.03.05-abc1234
  Reason: Production bug
```

---

## 🚀 Daily Workflow

### **Working on a Feature**

```bash
# 1. Create feature branch
git checkout -b feature/add-notifications
git push origin feature/add-notifications

# 2. Make changes, commit
git add .
git commit -m "feat: add email notifications"
git push

# 3. Open PR on GitHub
feature/add-notifications → dev

# 4. CI runs automatically (~5-8 min)
# - Check status in GitHub Actions
# - Read auto-comment on PR

# 5. If green, request review
# If red, fix and push again

# 6. After approval, merge to dev
```

### **Deploying to Production**

```bash
# 1. When ready, create PR: dev → main
# 2. CI runs (quick check, ~5 min)
# 3. After approval, merge
# 4. CD pipeline runs automatically
# 5. Check deployment in Actions tab
# 6. Verify smoke tests pass
```

---

## ✅ What Gets Checked

### **Every PR:**
- ✅ Code compiles (TypeScript)
- ✅ Code style (ESLint)
- ✅ Tests pass
- ✅ Build succeeds
- ✅ npm audit (dependency vulnerabilities)
- ✅ Snyk scan (advanced dependency check)
- ✅ CodeQL SAST (code security analysis)
- ✅ Trivy scan (container vulnerabilities)

### **PRs to dev (additional):**
- ✅ Integration tests with real database
- ✅ Full API testing

### **PRs to main:**
- ✅ Standard checks only (fast)
- ✅ Assumes already tested in dev

---

## 📊 Typical Timings

| Action | Time | Who |
|--------|------|-----|
| Local dev | 0 min | You |
| Open PR | instant | You |
| CI pipeline | 10-15 min | Automated |
| Code review | 10-30 min | Team member |
| Merge to dev | instant | You |
| Later: PR to main | 10-15 min | You |
| CD deployment | 10-15 min | Automated |
| **Total to prod** | **40-75 min** | |

---

## 🔧 Before Opening PR

**Run these locally to catch issues early:**

```bash
# Type check
npm run ts

# Linting
npm run lint

# Tests
npm test

# Build
npm run build
```

**This takes ~3 minutes locally and prevents CI failures!**

---

## 💬 PR Comment Example

After CI runs, you'll see:

```markdown
## ✅ CI Pipeline Results

**Target branch:** `dev`
**Status:** success

### Checks Performed:
- ✅ TypeScript validation
- ✅ ESLint checks
- ✅ Unit tests
- ✅ Build verification
- ✅ npm audit
- ✅ Snyk security scan
- ✅ CodeQL SAST analysis
- ✅ Trivy container scan
- ✅ Integration tests

---
🔗 [View detailed logs](...)

✅ **All checks passed!** Ready for review.
```

---

## ❌ Common Issues

### **1. ESLint Errors**

**Error in CI:**
```
Error: 3 errors, 2 warnings found
```

**Fix:**
```bash
npm run lint -- --fix
git add .
git commit -m "fix: linting"
git push
```

---

### **2. Unit Test Failures**

**Error in CI:**
```
FAIL src/modules/leave-request/service.spec.ts
```

**Fix:**
```bash
# Run test locally
npm test src/modules/leave-request/service.spec.ts

# Fix the issue
# Then commit
git add .
git commit -m "fix: correct test"
git push
```

---

### **3. Build Failures**

**Error in CI:**
```
TypeScript error: Cannot find name 'foo'
```

**Fix:**
```bash
# Check types locally
npm run ts

# Fix the error
# Then commit
```

---

### **4. Integration Test Failures**

**Error in CI:**
```
newman: POST /leave-requests → 500
```

**Fix:**
```bash
# Test locally with database
docker-compose up -d postgres
npm run prisma:migrate:deploy
npm run start

# Test the endpoint
curl -X POST http://localhost:3000/leave-requests -d '...'

# Fix and commit
```

---

## 🎯 Small Team Best Practices

### **1. Keep PRs Small**
- ✅ < 300 lines of code
- ✅ Single feature/fix
- ✅ Easier to review
- ✅ Faster to merge

### **2. Review Quickly**
- ✅ Review within 2-4 hours
- ✅ Don't let PRs go stale
- ✅ Informal is OK for small changes

### **3. Merge Often**
- ✅ Merge to dev daily
- ✅ Deploy to prod weekly
- ✅ Avoid long-lived branches

### **4. Trust but Verify**
- ✅ CI catches most issues
- ✅ Code review for logic
- ✅ Don't over-process

### **5. Communicate**
- ✅ Slack/Teams for quick questions
- ✅ PR comments for code discussion
- ✅ Don't be formal

---

## 📈 Metrics to Track

### **For Your Team:**

1. **PR Cycle Time**
   - Open → Merged: Aim for < 24 hours

2. **CI Success Rate**
   - Target: > 90% pass on first try

3. **Deployment Frequency**
   - Small teams: 1-2x per week is good

4. **Mean Time to Recovery**
   - If deployment fails: < 1 hour to rollback

---

## 🚨 Emergency Procedures

### **Production is Down!**

1. **Check deployment logs**
   ```
   Actions → CD Pipeline → Latest run
   ```

2. **Rollback if needed**
   ```
   Actions → Rollback Deployment → Run workflow
   Version: [previous working version]
   Reason: Production issue
   ```

3. **Verify rollback**
   ```
   curl https://your-app.com/health
   ```

4. **Fix and redeploy**
   - Fix the issue in new PR
   - Merge and redeploy

---

## 🔒 Security Scanning

Your CI pipeline now includes **comprehensive security scanning**:

### **1. Dependency Vulnerabilities**

**npm audit:**
- Built into npm
- Scans `package-lock.json`
- Checks for known CVEs in dependencies
- Fails on HIGH/CRITICAL severity

**Snyk (optional but recommended):**
- More comprehensive than npm audit
- Better vulnerability database
- Provides fix suggestions
- **Setup:** Add `SNYK_TOKEN` secret to GitHub

### **2. Static Application Security Testing (SAST)**

**CodeQL:**
- GitHub's native security scanner
- Analyzes TypeScript/JavaScript code
- Detects:
  - SQL injection
  - XSS vulnerabilities
  - Command injection
  - Path traversal
  - Insecure cryptography
- Results appear in GitHub Security tab

### **3. Container Security**

**Trivy:**
- Scans Docker images for vulnerabilities
- Checks:
  - OS packages (Alpine Linux)
  - Node.js runtime
  - Application dependencies
- **Fails build on CRITICAL vulnerabilities**

### **Security Reports Location:**

All security findings are uploaded to:
```
GitHub → Security → Code scanning alerts
```

---

## 🔐 Optional Secrets

For enhanced security features:

```bash
SNYK_TOKEN              # For Snyk security scanning
                        # Get from: https://snyk.io/account
```

**Without SNYK_TOKEN:** Pipeline will skip Snyk scan (npm audit still runs)

---

## 📚 Related Docs

- [Deployment & Rollback Guide](./DEPLOYMENT_VERSIONING.md)
- [README](../README.md)

---

## 🆘 Getting Help

### **CI Pipeline Failing?**

1. Click the red ❌ in GitHub
2. Click "Details"
3. Read the error log
4. Fix locally and push

### **Don't Know How to Fix?**

1. Ask in team Slack/Teams
2. Share the CI log link
3. Someone will help!

### **Still Stuck?**

1. Check GitHub Issues for similar problems
2. Google the error message
3. Stack Overflow
4. Last resort: Skip CI with `--no-verify` (rare!)

---

## ✨ Summary

Your CI/CD is **simple, fast, and practical** for small teams:

- ⚡ Fast feedback (5-8 minutes)
- 🎯 Catches real issues
- 📝 Clear PR comments
- 🔄 Easy rollback
- 👥 Built for 2-10 developers

**Don't overthink it!** This setup will serve you well until you grow beyond 10-15 developers.

---

**Remember:** The best CI/CD is the one your team actually uses. Keep it simple! 🚀
