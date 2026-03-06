# Branch Setup & Protection Configuration

## ✅ Branch Status

**All branches created and synced:**

```
main     ← Production (deploys to Render)
  ↑
staging  ← Integration validation
  ↑
develop  ← Active development
  ↑
feature/*  ← Feature branches
```

**Sync Status:** All branches are at commit `711f6b9`

---

## 🛡️ Branch Protection Rules

### **Branch: `develop`**

**Purpose:** Collect features, fast validation

**Protection Rules:**
```yaml
Required Status Checks:
  ✅ CI Pipeline must pass
    - code-quality
    - unit-tests
    - build
    - security-scans (npm audit + gitleaks)

Pull Request Requirements:
  ✅ Require 1 approval
  ✅ Dismiss stale reviews on push
  ✅ Require conversation resolution

Additional Settings:
  ✅ Require branches to be up to date
  ✅ Include administrators (no bypassing!)
  ✅ Allow force pushes: NO
  ✅ Allow deletions: NO
```

---

### **Branch: `staging`**

**Purpose:** Full integration testing before production

**Protection Rules:**
```yaml
Required Status Checks:
  ✅ Staging Pipeline must pass
    - full-build
    - integration-tests
    - e2e-tests
    - security-scans (full: CodeQL + Trivy)
    - docker-build-validation

Pull Request Requirements:
  ✅ Require 1 approval
  ✅ Dismiss stale reviews on push
  ✅ Require conversation resolution
  ✅ Restrict who can push (only from develop)

Additional Settings:
  ✅ Require branches to be up to date
  ✅ Require linear history (no merge commits)
  ✅ Include administrators (no bypassing!)
  ✅ Allow force pushes: NO
  ✅ Allow deletions: NO
```

---

### **Branch: `main`**

**Purpose:** Production - triggers deployment to Render

**Protection Rules:**
```yaml
Required Status Checks:
  ✅ Main PR Pipeline must pass
    - sanity-tests
    - deployment-readiness

Pull Request Requirements:
  ✅ Require 2 approvals (higher bar!)
  ✅ Require review from code owners
  ✅ Dismiss stale reviews on push
  ✅ Require conversation resolution
  ✅ Restrict who can push (only from staging)

Additional Settings:
  ✅ Require branches to be up to date
  ✅ Require linear history
  ✅ Require signed commits (optional but recommended)
  ✅ Include administrators (no bypassing!)
  ✅ Allow force pushes: NO
  ✅ Allow deletions: NO
  ✅ Block creation (no direct commits)
```

---

## 🚀 Setup Instructions

### **Option 1: GitHub CLI (Automated)**

Run the setup script:

```bash
./scripts/setup-branch-protection.sh
```

### **Option 2: GitHub UI (Manual)**

#### **For `develop` branch:**

1. Go to: Settings → Branches → Add rule
2. Branch name pattern: `develop`
3. Check:
   - ✅ Require a pull request before merging
     - Require 1 approval
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date
     - Add: `ci-checks` (job name from ci.yml)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches (optional)
4. Save changes

#### **For `staging` branch:**

1. Go to: Settings → Branches → Add rule
2. Branch name pattern: `staging`
3. Check:
   - ✅ Require a pull request before merging
     - Require 1 approval
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date
     - Add: `staging-validation` (job name from staging pipeline)
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
   - ✅ Do not allow bypassing the above settings
4. Save changes

#### **For `main` branch:**

1. Go to: Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Check:
   - ✅ Require a pull request before merging
     - Require 2 approvals
     - Require review from Code Owners
   - ✅ Require status checks to pass before merging
     - Require branches to be up to date
     - Add: `main-pr-check` (job name from main PR pipeline)
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
   - ✅ Require signed commits (optional)
   - ✅ Do not allow bypassing the above settings
   - ✅ Block creations (prevent direct commits)
4. Save changes

---

## 📋 Verification Checklist

After setup, verify:

- [ ] `develop` branch shows "Protected" badge
- [ ] `staging` branch shows "Protected" badge
- [ ] `main` branch shows "Protected" badge
- [ ] Cannot push directly to `develop`
- [ ] Cannot push directly to `staging`
- [ ] Cannot push directly to `main`
- [ ] Can create PRs to `develop`
- [ ] CI runs on PRs to `develop`
- [ ] Cannot merge without approval

---

## 🧪 Test the Setup

### **Test 1: Feature → Develop PR**

```bash
# Create feature branch
git checkout -b feature/test-protection
echo "test" >> README.md
git add README.md
git commit -m "test: verify branch protection"
git push origin feature/test-protection

# Open PR on GitHub
# Should trigger CI pipeline
# Should require 1 approval before merge
```

### **Test 2: Try Direct Push (Should Fail)**

```bash
git checkout develop
echo "test" >> README.md
git commit -am "test: try direct push"
git push origin develop

# Expected: ❌ Error - protected branch
```

### **Test 3: Develop → Staging**

```bash
# After feature merged to develop
git checkout staging
git merge develop
git push origin staging

# Should trigger staging pipeline
# Should run full tests
```

---

## 🔧 Troubleshooting

### **"Status check not found"**

**Problem:** Status checks not appearing in branch protection

**Solution:**
1. Run CI pipeline at least once
2. Wait for pipeline to complete
3. Refresh branch protection settings
4. Status checks should appear in dropdown

### **"Unable to push - protected branch"**

**Problem:** Trying to push directly

**Solution:**
✅ This is correct behavior!
✅ Use pull requests instead
✅ Follow: feature → develop → staging → main

### **"Required reviews not met"**

**Problem:** Can't merge without approvals

**Solution:**
✅ Request review from team member
✅ Get approval(s) based on branch requirements
✅ Develop: 1 approval
✅ Staging: 1 approval
✅ Main: 2 approvals

---

## 📚 Related Documentation

- [CI/CD Guide](./CI_CD_GUIDE.md)
- [Deployment Versioning](./DEPLOYMENT_VERSIONING.md)
- [Branch Strategy](#) - This document

---

## 🎯 Summary

**Branch Protection Status:**

| Branch | Protection | Approvals | Status Checks | Direct Push |
|--------|-----------|-----------|---------------|-------------|
| `develop` | ✅ | 1 | CI Pipeline | ❌ Blocked |
| `staging` | ✅ | 1 | Staging Tests | ❌ Blocked |
| `main` | ✅ | 2 | Main PR Check | ❌ Blocked |

**All branches are now protected and require pull requests!** 🛡️
