# Deployment Versioning and Rollback Guide

## 📦 Semantic Versioning

This project now uses **automatic semantic versioning** for all deployments.

### Version Format
```
YYYY.MM.DD-{git-short-sha}
```

Example: `2026.03.05-abc1234`

### How It Works

1. **Automatic Tag Creation**: Every deployment to `main` creates a git tag
2. **Docker Image Tagging**: Each version is tagged in GitHub Container Registry
3. **Version Tracking**: All deployed versions are tracked in git tags

### View Available Versions

```bash
# List all version tags
git tag --sort=-creatordate | head -20

# Or use GitHub Actions workflow
Go to: Actions → CD Pipeline → Run workflow → Select "list-versions"
```

---

## 🔄 Rollback Procedures

### Method 1: GitHub Actions (Recommended)

#### Using the CD Pipeline Rollback Action:

1. **Navigate to Actions Tab**
   - Go to your repository
   - Click on "Actions" tab
   - Select "CD Pipeline" workflow

2. **Trigger Rollback**
   - Click "Run workflow" dropdown
   - Select **"rollback"** from action dropdown
   - Enter the version to rollback to (e.g., `2026.03.05-abc1234`)
   - Provide a reason for the rollback
   - Click "Run workflow"

3. **Monitor Progress**
   - Watch the workflow execution
   - Check rollback summary in logs
   - Verify deployment status

#### What Happens During Rollback:
```
1. ✅ Validates version exists
2. ✅ Checks out the specific commit
3. ✅ Checks if Docker image exists (or rebuilds if needed)
4. ✅ Triggers Render deployment
5. ✅ Monitors deployment status
6. ✅ Runs smoke tests
7. ✅ Reports success/failure
```

### Method 2: Manual Rollback via Render Dashboard

1. **Login to Render Dashboard**
   - Go to https://dashboard.render.com/
   - Navigate to your service

2. **Find Previous Deployment**
   - Click on "Deploys" tab
   - Find the working version
   - Click "Redeploy"

3. **Confirm Rollback**
   - Verify the commit SHA
   - Click "Deploy"

### Method 3: Emergency Rollback via Git

```bash
# 1. Identify the working version
git tag --sort=-creatordate

# 2. Create a revert commit
git revert <bad-commit-sha>

# 3. Push to trigger new deployment
git push origin main
```

---

## 🧪 Smoke Tests

### Automatic Smoke Tests Run On:
- ✅ Every deployment
- ✅ Every rollback
- ✅ PR merge to main

### Test Coverage:
1. **Health Check** - `/health` endpoint
2. **Root Endpoint** - `/` accessibility
3. **Leave Requests** - `/leave-requests` listing
4. **Statistics** - `/leave-requests/statistics` data

### Test Failure Response:
- ❌ Deployment marked as failed
- ❌ Previous version remains active
- 📧 Team notified via GitHub notifications
- 📊 Logs available in Actions tab

---

## 📊 Version History

### View Deployment History

```bash
# List all deployments with dates
git tag --sort=-creatordate | while read tag; do
  echo "Version: $tag"
  git log -1 --format="Date: %ai%nCommit: %H%nMessage: %s" "$tag"
  echo "---"
done
```

### Check Current Production Version

```bash
# Via API
curl https://your-app.onrender.com/health

# Via Git
git describe --tags --abbrev=0
```

---

## 🚨 Deployment Failure Scenarios

### Scenario 1: Build Failure
**What happens:**
- Docker build fails
- Pipeline stops immediately
- Old version keeps running

**Action required:**
- Fix the build issue
- Push new commit
- No rollback needed (old version still live)

### Scenario 2: Deployment Failure
**What happens:**
- New version fails to start
- Health checks fail
- Render keeps old version

**Action required:**
- Use rollback workflow
- Or fix and redeploy

### Scenario 3: Smoke Test Failure
**What happens:**
- Deployment completes
- Smoke tests fail
- Pipeline marked as failed

**Action required:**
- Immediate rollback recommended
- Investigate issue
- Fix and redeploy

---

## 🔒 Required Secrets

Ensure these secrets are set in GitHub repository settings:

### For Deployment:
```
RENDER_DEPLOY_HOOK      # Render webhook URL
RENDER_API_KEY          # Render API key (for status monitoring)
RENDER_SERVICE_ID       # Render service ID
RENDER_APP_URL          # Your app URL (optional, for smoke tests)
```

### For Rollback:
```
RENDER_DEPLOY_HOOK      # Required
RENDER_API_KEY          # Recommended (for monitoring)
RENDER_SERVICE_ID       # Recommended (for monitoring)
```

---

## 📝 Best Practices

### 1. Before Deployment
- ✅ Run tests locally: `npm test`
- ✅ Check TypeScript: `npm run ts`
- ✅ Run linter: `npm run lint`
- ✅ Test integration: `npm run test:integration`

### 2. After Deployment
- ✅ Monitor smoke tests in Actions
- ✅ Check application logs in Render
- ✅ Verify endpoints manually
- ✅ Monitor error rates

### 3. Version Naming
- ✅ Automatic (no manual intervention needed)
- ✅ Based on date + commit SHA
- ✅ Unique and traceable

### 4. Rollback Decision Criteria
- ❌ Critical bugs in production
- ❌ Service degradation
- ❌ Data corruption risk
- ❌ Security vulnerabilities
- ✅ Minor issues → Fix forward instead

---

## 🔧 Troubleshooting

### Rollback Workflow Fails

**Problem:** Version not found
```bash
# Solution: List available versions
git tag --sort=-creatordate
# Use exact tag name
```

**Problem:** Docker image missing
```bash
# Solution: The workflow will automatically rebuild from source
# No action needed
```

**Problem:** Render deployment timeout
```bash
# Solution: Check Render dashboard
# May need to restart service manually
```

### Smoke Tests Fail

**Problem:** Endpoint not responding
```bash
# Check deployment logs
# Verify environment variables
# Check database connectivity
```

**Problem:** Invalid response format
```bash
# API contract may have changed
# Update smoke tests in cd.yml
```

---

## 📞 Emergency Contacts

If automated rollback fails:

1. **Check Render Dashboard**: https://dashboard.render.com/
2. **View GitHub Actions**: Repository → Actions tab
3. **Check Logs**: Render service logs
4. **Manual Intervention**: Use Render dashboard to redeploy previous version

---

## 🎯 Quick Reference

### List Versions
```bash
# Via GitHub Actions
Actions → CD Pipeline → Run workflow → Select "list-versions"

# Via git
git tag --sort=-creatordate | head -20
```

### Trigger Rollback
```bash
# Via GitHub Actions
Actions → CD Pipeline → Run workflow
  Action: rollback
  Version: 2026.03.05-abc1234
  Reason: "Production bug"
```

### Check Current Version
```bash
curl https://your-app.onrender.com/health | jq .
```

### View Deployment History
```bash
git tag --sort=-creatordate | head -10
```

---

## 📈 Monitoring

### Deployment Success Metrics
- Build time
- Deployment duration
- Smoke test results
- Error rates

### Version Tracking
- All versions tagged in git
- Docker images in GHCR
- Deployment history in Render

---

## 🔄 Continuous Improvement

This versioning and rollback system will evolve based on:
- Team feedback
- Incident retrospectives
- Production metrics
- Industry best practices

For questions or improvements, create an issue in the repository.
