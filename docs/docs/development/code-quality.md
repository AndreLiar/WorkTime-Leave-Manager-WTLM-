---
sidebar_position: 1
---

# Code Quality and Git Hooks

Overview of code quality tools and automated checks using Husky, lint-staged, ESLint, and Prettier.

## Tools Overview

| Tool | Purpose | When It Runs |
|------|---------|--------------|
| Husky | Git hooks manager | On git commands |
| lint-staged | Run linters on staged files | Pre-commit |
| ESLint | JavaScript/TypeScript linting | Pre-commit, manually |
| Prettier | Code formatting | Pre-commit, manually |
| TypeScript | Type checking | Manually, CI/CD |
| Jest | Unit testing | Manually, CI/CD |

## Husky - Git Hooks

Husky manages Git hooks to enforce quality checks before commits.

### What is Husky?

Husky is a tool that makes Git hooks easy. It prevents bad commits by running automated checks.

### Installation

Husky is already installed and configured. When you run npm install, the prepare script automatically sets up Husky.

### Directory Structure

```
.husky/
├── _/              (Husky internal files)
└── pre-commit      (Runs before each commit)
```

### Pre-commit Hook

Location: `.husky/pre-commit`

Content:
```bash
npx lint-staged
```

What it does:
- Runs automatically before every git commit
- Executes lint-staged on staged files
- Blocks commit if checks fail
- Full flow: `git commit` → Husky hook → `lint-staged` → ESLint + Prettier

## lint-staged - Staged Files Linting

lint-staged runs linters only on files that are staged for commit, making it fast and efficient.

### Configuration

Location: `package.json`

The configuration specifies that for every TypeScript file staged for commit:

1. ESLint checks and auto-fixes code issues
2. Prettier formats code consistently

If any check fails, the commit is blocked.

### Example Flow

```bash
# 1. Make changes to files
vim src/app.module.ts

# 2. Stage files
git add src/app.module.ts

# 3. Attempt to commit
git commit -m "feat: update app module"

# 4. Husky triggers pre-commit hook
# 5. lint-staged runs on staged .ts files
# 6. If all checks pass, commit succeeds
# 7. If any check fails, commit is blocked
```

## ESLint - Code Linting

ESLint analyzes your code for potential errors and enforces coding standards.

### Configuration

Location: `eslint.config.mjs`

### Usage

```bash
# Run ESLint on all files
npm run lint

# Check specific file
npx eslint src/app.module.ts

# Fix specific file
npx eslint src/app.module.ts --fix
```

### Common ESLint Errors

| Error | Description | Fix |
|-------|-------------|-----|
| no-unused-vars | Variable declared but never used | Remove or use the variable |
| @typescript-eslint/no-unused-vars | TypeScript unused variable | Remove unused imports/variables |
| semi | Missing semicolon | Add semicolon or configure rule |
| quotes | Wrong quote style | Use configured quote style |

## Prettier - Code Formatting

Prettier enforces consistent code style across the project.

### Usage

```bash
# Format all files
npx prettier --write "src/**/*.ts"

# Check formatting without modifying
npx prettier --check "src/**/*.ts"

# Format specific file
npx prettier --write src/app.module.ts
```

### Prettier Rules

- Single quotes for strings
- 2 spaces for indentation
- Semicolons required
- Trailing commas in multi-line objects
- Line width: 80 characters (default)

## Workflow Examples

### Successful Commit

```bash
git add src/modules/leave-request/leave-request.service.ts

git commit -m "feat(leave): add approval logic"

# Output:
# ✔ Preparing lint-staged...
# ✔ Running tasks for staged files...
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
# [main abc1234] feat(leave): add approval logic
#  1 file changed, 15 insertions(+), 5 deletions(-)
```

### Failed Commit (Linting Error)

When ESLint finds an error, the commit is blocked:

```bash
git add src/app.module.ts
git commit -m "fix: update imports"

# Output shows the error
# husky - pre-commit hook exited with code 1 (error)
```

Fix the error and try again:

```bash
vim src/app.module.ts  # Fix the issue
git add src/app.module.ts
git commit -m "fix: update imports"
# Now it should pass
```

### Skipping Hooks (Not Recommended)

If you absolutely need to skip hooks:

```bash
git commit -m "message" --no-verify
```

**Warning**: Only use --no-verify in emergencies. It bypasses all quality checks.

## Manual Quality Checks

### Before Committing

```bash
# Run all checks manually
npm run lint        # ESLint
npm run ts          # TypeScript check
npm test            # Unit tests
npm run build       # Full build
```

## Troubleshooting

### Husky Not Running

```bash
# Reinstall Husky hooks
npm run prepare
```

### lint-staged Not Found

```bash
# Reinstall dependencies
npm install
```

### ESLint Errors After Pull

```bash
# Update dependencies
npm install

# Clear cache
rm -rf node_modules/.cache
npm run lint
```

## Best Practices

### 1. Commit Often

Make small, focused commits that pass all checks.

### 2. Fix Issues Immediately

Don't skip hooks. Fix the issues:
- ESLint errors indicate potential bugs
- Prettier ensures consistency
- TypeScript errors prevent runtime issues

### 3. Test Locally First

Before committing:

```bash
npm run lint
npm test
npm run build
```

### 4. Use Descriptive Commit Messages

Good examples:
- feat(api): add leave request approval endpoint
- fix(database): resolve connection timeout issue
- docs: update API documentation

Bad examples:
- update
- fix bug
- changes

### 5. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update carefully
npm update
```

## Configuration Files

### .husky/pre-commit

```bash
npx lint-staged
```

### package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "ts": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

## Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)

## Summary

**Automated Checks on Every Commit:**
1. ESLint - Code quality
2. Prettier - Code formatting
3. Runs only on staged files (fast)
4. Blocks bad commits
5. Maintains code quality

**Manual Checks:**
- `npm run lint` - Run ESLint
- `npm run ts` - Type check
- `npm test` - Run tests
- `npm run build` - Full build

This ensures high code quality and consistency across the entire project!
