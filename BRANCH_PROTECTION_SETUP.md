# 🛡️ Branch Protection Setup Guide

## Quick Setup Instructions

Follow these steps to set up branch protection for `develop`, `staging`, and `main` branches.

---

## 📍 Step 1: Access GitHub Settings

1. **Open your repository on GitHub:**
   ```
   https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-
   ```

2. **Click the "Settings" tab** (top navigation bar)

3. **Click "Branches"** in the left sidebar (under "Code and automation")

---

## 🟢 Step 2: Protect `develop` Branch

### Click "Add branch protection rule"

### Configure the following settings:

#### Branch name pattern
```
develop
```

#### Protect matching branches

**✅ Require a pull request before merging**
- Check this box
- Click to expand settings:
  - ✅ **Require approvals:** Set to `1`
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require approval of the most recent reviewable push**

**✅ Require status checks to pass before merging**
- Check this box
- ✅ **Require branches to be up to date before merging**
- **Status checks that are required:**
  - ⚠️ Leave empty for now (will add after first CI run)
  - After first PR, add: `ci-checks`

**✅ Require conversation resolution before merging**
- Check this box

**✅ Do not allow bypassing the above settings**
- Check this box
- ✅ **Include administrators**

**❌ Allow force pushes**
- Leave UNCHECKED

**❌ Allow deletions**
- Leave UNCHECKED

### Click "Create" or "Save changes"

---

## 🟡 Step 3: Protect `staging` Branch

### Click "Add branch protection rule" again

### Configure the following settings:

#### Branch name pattern
```
staging
```

#### Protect matching branches

**✅ Require a pull request before merging**
- Check this box
- Click to expand settings:
  - ✅ **Require approvals:** Set to `1`
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require approval of the most recent reviewable push**

**✅ Require status checks to pass before merging**
- Check this box
- ✅ **Require branches to be up to date before merging**
- **Status checks that are required:**
  - ⚠️ Leave empty for now (will add after first staging run)
  - After first push, add: `staging-validation`

**✅ Require conversation resolution before merging**
- Check this box

**✅ Require linear history**
- Check this box (enforces clean history)

**✅ Do not allow bypassing the above settings**
- Check this box
- ✅ **Include administrators**

**❌ Allow force pushes**
- Leave UNCHECKED

**❌ Allow deletions**
- Leave UNCHECKED

### Click "Create" or "Save changes"

---

## 🔴 Step 4: Protect `main` Branch

### Click "Add branch protection rule" again

### Configure the following settings:

#### Branch name pattern
```
main
```

#### Protect matching branches

**✅ Require a pull request before merging**
- Check this box
- Click to expand settings:
  - ✅ **Require approvals:** Set to `2` (higher bar for production!)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require approval of the most recent reviewable push**
  - ✅ **Require review from Code Owners** (optional but recommended)

**✅ Require status checks to pass before merging**
- Check this box
- ✅ **Require branches to be up to date before merging**
- **Status checks that are required:**
  - ⚠️ Leave empty for now (will add after first main PR)
  - After first PR to main, add: `main-pr-check`

**✅ Require conversation resolution before merging**
- Check this box

**✅ Require linear history**
- Check this box (enforces clean history)

**✅ Require signed commits** (optional but recommended)
- Check this box if you want to enforce GPG signed commits

**✅ Block creations**
- Check this box (prevents accidental direct commits)

**✅ Do not allow bypassing the above settings**
- Check this box
- ✅ **Include administrators**

**❌ Allow force pushes**
- Leave UNCHECKED

**❌ Allow deletions**
- Leave UNCHECKED

### Click "Create" or "Save changes"

---

## ✅ Step 5: Verify Protection

### Check branch protection status:

1. Go to: **Settings → Branches**

2. You should see:
   ```
   Branch protection rules
   
   develop     [Protected]  [Edit]
   staging     [Protected]  [Edit]
   main        [Protected]  [Edit]
   ```

3. Click **[Edit]** on each to verify settings

---

## 🧪 Step 6: Test Protection

### Test that direct push is blocked:

```bash
# Try to push directly to develop (should fail)
git checkout develop
echo "test" >> README.md
git commit -am "test: verify protection"
git push origin develop
```

**Expected result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/develop.
remote: error: Changes must be made through a pull request.
To https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-.git
 ! [remote rejected] develop -> develop (protected branch hook declined)
error: failed to push some refs to 'https://github.com/AndreLiar/WorkTime-Leave-Manager-WTLM-.git'
```

✅ **Perfect! Protection is working!**

### Undo the test commit:
```bash
git reset --hard HEAD~1
```

---

## 📋 Summary Table

| Branch | Approvals | Status Checks | Linear History | Signed Commits | Block Creations |
|--------|-----------|---------------|----------------|----------------|-----------------|
| **develop** | 1 | ✅ | ❌ | ❌ | ❌ |
| **staging** | 1 | ✅ | ✅ | ❌ | ❌ |
| **main** | 2 | ✅ | ✅ | Optional | ✅ |

---

## ⚠️ Important Notes

### About Status Checks

**Why leave empty initially?**
- Status checks don't appear in the dropdown until they've run at least once
- After your first CI/CD pipeline runs, the status checks will become available

**When to add them:**

1. **For `develop`:**
   - Open a PR to develop
   - Wait for CI to complete
   - Go back to Settings → Branches → Edit `develop` rule
   - Click "Require status checks to pass before merging"
   - Search for and select: `ci-checks`
   - Save

2. **For `staging`:**
   - Push to staging
   - Wait for staging pipeline to complete
   - Go back to Settings → Branches → Edit `staging` rule
   - Search for and select: `staging-validation`
   - Save

3. **For `main`:**
   - Open a PR to main
   - Wait for main PR pipeline to complete
   - Go back to Settings → Branches → Edit `main` rule
   - Search for and select: `main-pr-check`
   - Save

---

## 🎯 What Each Protection Does

### Require Pull Request
- **What:** No direct pushes allowed
- **Why:** Forces code review
- **Effect:** All changes go through PRs

### Require Approvals
- **What:** Need X team members to approve
- **Why:** Ensures multiple eyes on code
- **Effect:** Can't merge without approval

### Dismiss Stale Reviews
- **What:** Approvals reset on new push
- **Why:** Ensures reviewers see latest changes
- **Effect:** May need re-approval after fixes

### Require Status Checks
- **What:** CI must pass before merge
- **Why:** Ensures code quality
- **Effect:** Broken code can't be merged

### Require Branches Up to Date
- **What:** Must merge latest base branch first
- **Why:** Prevents integration issues
- **Effect:** May need to update PR before merge

### Require Conversation Resolution
- **What:** All review comments must be resolved
- **Why:** Ensures discussions are addressed
- **Effect:** Can't merge with open discussions

### Require Linear History
- **What:** No merge commits allowed
- **Why:** Clean, readable history
- **Effect:** Must squash or rebase

### Block Creations
- **What:** Can't create new commits on branch
- **Why:** Prevents accidental direct work
- **Effect:** Must use PRs exclusively

---

## 🚨 Common Issues

### "I can still push to develop"

**Solution:**
- Make sure you clicked "Create" or "Save changes"
- Wait a few seconds for GitHub to apply rules
- Try again

### "Status checks not appearing"

**Solution:**
- Run the pipeline at least once first
- Wait for it to complete
- Refresh the branch protection settings page
- Status checks will appear in the search box

### "Can't merge even though CI passed"

**Check:**
1. Do you have required approvals?
2. Are all conversations resolved?
3. Is branch up to date with base?
4. Are status checks green?

### "Accidentally pushed directly"

**If it happens before protection:**
- Set up protection now
- Consider reverting the direct commit
- Re-do through PR

**If it happens after protection:**
- This shouldn't be possible
- Contact GitHub support if it does

---

## 📚 Additional Resources

- **GitHub Docs:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- **Our Docs:** See `docs/BRANCH_PROTECTION.md`
- **Docusaurus:** CI/CD → Branch Strategy

---

## ✅ Verification Checklist

After completing setup:

- [ ] `develop` branch shows "Protected" badge
- [ ] `staging` branch shows "Protected" badge  
- [ ] `main` branch shows "Protected" badge
- [ ] Direct push to develop fails
- [ ] Direct push to staging fails
- [ ] Direct push to main fails
- [ ] Can create PRs successfully
- [ ] Team members notified about new workflow

---

## 🎉 You're Done!

**Branch protection is now set up!**

### Next Steps:

1. ✅ **Inform your team** about the new workflow
2. ✅ **Test with a feature branch** to verify everything works
3. ✅ **Add status checks** after first pipeline runs
4. ✅ **Ready for Phase 2** - Tell me "Start Phase 2"!

---

## 💡 Pro Tips

### For Small Teams (< 5 people)

You might want to:
- Keep approvals at 1 for all branches (including main)
- Skip signed commits requirement
- Be flexible during initial learning phase

### For Growing Teams (5-10 people)

Recommended:
- Keep 2 approvals for main
- Consider adding CODEOWNERS file
- Enforce linear history
- Regular retrospectives on process

### CODEOWNERS File (Optional)

Create `.github/CODEOWNERS`:
```
# Default owners for everything
* @team-lead @senior-dev

# Specific areas
/src/modules/ @backend-team
/docs/ @docs-team
/.github/workflows/ @devops-team
```

---

## 🆘 Need Help?

**If something doesn't work:**

1. Check GitHub's status page: https://www.githubstatus.com/
2. Review the settings one more time
3. Try logging out and back in
4. Check your repository permissions
5. Ask in team chat or create an issue

**I'm here to help! Just ask if you run into any issues.** 💪

---

**Ready to proceed to Phase 2 when you are!** 🚀
