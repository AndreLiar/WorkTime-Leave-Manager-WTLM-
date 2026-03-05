# Pull Request Pipeline Guide

## 🔵 Overview

The PR Pipeline runs **before code is merged** to ensure quality and security. It implements a "fail fast" strategy to catch issues early.

## 🎯 Trigger Conditions

**Triggers when:**
- Opening a new PR to `dev` or `develop` branch
- Pushing new commits to an open PR
- Reopening a PR

**From branches:**
- `feature/*` → `dev`
- `bugfix/*` → `dev`
- `hotfix/*` → `dev`

## 📋 Pipeline Jobs

### Job 1: Code Quality & Linting
**Purpose:** Ensure code meets style and quality standards

**Steps:**
- ✅ TypeScript type checking
- ✅ ESLint linting (no warnings allowed)
- ✅ Code formatting check (Prettier)

**Fails if:**
- TypeScript errors found
- ESLint warnings/errors found
- Code not formatted properly

---

### Job 2: Unit Tests
**Purpose:** Verify business logic and components

**Steps:**
- ✅ Run all unit tests
- ✅ Generate coverage report
- ✅ Upload coverage to Codecov
- ✅ Comment PR with coverage stats

**Fails if:**
- Any unit test fails
- Coverage drops significantly

---

### Job 3: Build & Container Security
**Purpose:** Build application and scan for vulnerabilities

**Steps:**
- ✅ Build TypeScript application
- ✅ Build Docker container
- ✅ Run Trivy vulnerability scanner
- ✅ Upload results to GitHub Security
- ✅ Fail on critical vulnerabilities

**Scans for:**
- OS vulnerabilities
- Library vulnerabilities
- Container misconfigurations
- Exposed secrets

**Fails if:**
- Build fails
- Critical vulnerabilities found

---

### Job 4: Dependency Security Scan
**Purpose:** Check for vulnerable dependencies

**Steps:**
- ✅ npm audit (high severity threshold)
- ✅ Snyk security scan (if configured)
- ✅ Check for outdated dependencies

**Fails if:**
- High/critical npm vulnerabilities found

---

### Job 5: SAST (Static Application Security Testing)
**Purpose:** Analyze code for security issues

**Steps:**
- ✅ Initialize CodeQL
- ✅ Scan TypeScript/JavaScript code
- ✅ Upload findings to GitHub Security

**Detects:**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Command injection
- Path traversal
- Insecure crypto usage

---

### Job 6: Integration Tests
**Purpose:** Test the full application with real database

**Steps:**
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Start application
- ✅ Run Newman/Postman tests
- ✅ Upload test results

**Tests:**
- All API endpoints
- Database integration
- Business workflows

**Fails if:**
- Database migration fails
- Application won't start
- Any integration test fails

---

### Job 7: PR Summary
**Purpose:** Provide clear status overview

**Steps:**
- ✅ Collect all job results
- ✅ Generate summary table
- ✅ Post comment on PR
- ✅ Set overall status

**Comment Example:**
```markdown
## 🔍 PR Pipeline Results

| Job | Status |
|-----|--------|
| Code Quality | ✅ success |
| Unit Tests | ✅ success |
| Build & Security Scan | ✅ success |
| Dependency Scan | ✅ success |
| SAST Scan | ✅ success |
| Integration Tests | ✅ success |

---
✅ **All checks passed!** This PR is ready for review.
```

---

## 🔒 Required Secrets

### Optional (Recommended):
```bash
SNYK_TOKEN              # For Snyk security scanning
CODECOV_TOKEN           # For code coverage tracking
```

If not set, those steps will be skipped.

---

## 🚀 Workflow Example

### Step 1: Create Feature Branch
```bash
git checkout -b feature/add-notifications
# Make your changes
git add .
git commit -m "feat: Add email notifications"
git push origin feature/add-notifications
```

### Step 2: Open Pull Request
```bash
# On GitHub:
# feature/add-notifications → dev
# Open Pull Request
```

### Step 3: Pipeline Runs Automatically
```
⏳ Code Quality & Linting     - Running
⏳ Unit Tests                  - Running
⏳ Build & Container Security  - Queued
⏳ Dependency Security Scan    - Queued
⏳ SAST Scan                   - Queued
⏳ Integration Tests           - Queued
⏳ PR Summary                  - Queued
```

### Step 4: Review Results
```
✅ Code Quality & Linting     - Passed
✅ Unit Tests                  - Passed (95% coverage)
✅ Build & Container Security  - Passed (0 critical)
✅ Dependency Security Scan    - Passed
✅ SAST Scan                   - Passed
✅ Integration Tests           - Passed (10/10 tests)
✅ PR Summary                  - Posted
```

### Step 5: Merge or Fix
- **If all green:** Ready to merge! ✅
- **If red:** Fix issues and push new commit

---

## ❌ Common Failure Scenarios

### Scenario 1: ESLint Errors
**Error:**
```
✖ 5 problems (3 errors, 2 warnings)
```

**Fix:**
```bash
npm run lint -- --fix
git add .
git commit -m "fix: resolve linting issues"
git push
```

---

### Scenario 2: Unit Test Failures
**Error:**
```
FAIL src/modules/leave-request/leave-request.service.spec.ts
  ● LeaveRequestService › should create leave request
    Expected: 200
    Received: 400
```

**Fix:**
```bash
# Fix the test or code
npm test
git add .
git commit -m "fix: correct leave request validation"
git push
```

---

### Scenario 3: Container Vulnerabilities
**Error:**
```
CRITICAL: 2 vulnerabilities found
- CVE-2024-1234 in libssl3
- CVE-2024-5678 in node
```

**Fix:**
```dockerfile
# Update Dockerfile base image
FROM node:20.11-alpine  # newer version
```

```bash
git add Dockerfile
git commit -m "fix: update base image to resolve CVE-2024-1234"
git push
```

---

### Scenario 4: Integration Test Failures
**Error:**
```
newman: POST /leave-requests → 500 Internal Server Error
```

**Fix:**
```bash
# Check the endpoint locally
npm run start:dev
# Test manually
curl -X POST http://localhost:3000/leave-requests -d '...'
# Fix the issue
git add .
git commit -m "fix: resolve leave request creation bug"
git push
```

---

## 📊 Pipeline Metrics

### Typical Duration:
- Code Quality: ~2 minutes
- Unit Tests: ~3 minutes
- Build & Security: ~5 minutes
- Dependency Scan: ~1 minute
- SAST Scan: ~3 minutes
- Integration Tests: ~4 minutes
- **Total: ~18 minutes**

### Success Rate Target:
- **95%+** of PRs should pass on first run
- Issues should be caught before creating PR

---

## 🎯 Best Practices

### Before Opening PR:

1. **Run Locally:**
   ```bash
   npm run lint        # Check linting
   npm run ts          # Check types
   npm test            # Run unit tests
   npm run build       # Ensure builds
   ```

2. **Test Integration:**
   ```bash
   docker-compose up -d postgres
   npm run prisma:migrate:deploy
   npm run start
   # Test API manually
   ```

3. **Check Dependencies:**
   ```bash
   npm audit
   npm outdated
   ```

### While PR is Open:

- ✅ Monitor pipeline progress
- ✅ Fix issues promptly
- ✅ Keep PR size manageable (<500 lines)
- ✅ Respond to review comments

### After Pipeline Passes:

- ✅ Request review from team
- ✅ Address review feedback
- ✅ Squash commits if needed
- ✅ Merge when approved

---

## 🔧 Troubleshooting

### Pipeline Stuck/Hanging

**Problem:** Pipeline running for >30 minutes

**Solution:**
```bash
# Cancel the workflow
# Check for:
- Database connection issues
- Infinite loops in tests
- Timeout configurations
```

---

### False Positives in Security Scans

**Problem:** Vulnerability in dev dependency

**Solution:**
```bash
# Add to .trivyignore or Snyk policy
echo "CVE-2024-XXXX" >> .trivyignore
```

---

### Flaky Integration Tests

**Problem:** Tests pass/fail randomly

**Solution:**
```bash
# Add proper waits
await new Promise(resolve => setTimeout(resolve, 1000));

# Or increase timeouts
--timeout 10000
```

---

## 📈 Continuous Improvement

### Track Metrics:
- Pipeline success rate
- Average duration
- Most common failures
- Time to fix issues

### Optimize:
- Cache dependencies effectively
- Parallelize independent jobs
- Skip redundant scans
- Use matrix strategy for multiple Node versions

---

## 🔗 Related Documentation

- [CI/CD Overview](./README.md)
- [Deployment Versioning](./DEPLOYMENT_VERSIONING.md)
- [Code Quality Standards](./CODE_QUALITY.md)
- [Security Guidelines](./SECURITY.md)

---

## 🆘 Getting Help

### Pipeline Failing?

1. **Check logs**: Click on failed job in GitHub Actions
2. **Search similar issues**: Check repo issues/discussions
3. **Ask team**: Slack/Teams channel
4. **Update documentation**: If you find a solution

### Need to Skip Pipeline?

**Don't!** But if absolutely necessary:
```bash
# Emergency only - requires admin approval
git commit --no-verify -m "..."
```

This should be **extremely rare** and documented.

---

## ✅ PR Pipeline Checklist

Before opening PR:
- [ ] Code compiles without errors
- [ ] All tests pass locally
- [ ] Code follows style guide
- [ ] No console.logs or debugger statements
- [ ] Documentation updated
- [ ] Commit messages are clear

After pipeline runs:
- [ ] All jobs passed ✅
- [ ] Coverage maintained/improved
- [ ] No new vulnerabilities
- [ ] Integration tests pass
- [ ] PR reviewed and approved
- [ ] Ready to merge!

---

**Remember:** The PR pipeline is your safety net. Don't bypass it! 🛡️
