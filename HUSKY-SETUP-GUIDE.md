# Husky Pre-Commit Hook Setup Guide

Complete guide to add Husky with lint-staged to any Node.js/TypeScript project.

## Prerequisites

- Node.js project with `package.json`
- Git repository initialized
- ESLint and Prettier already configured

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install --save-dev husky lint-staged
```

### 2. Initialize Husky

```bash
npx husky init
```

This creates:
- `.husky/` directory
- `.husky/pre-commit` file
- Adds `"prepare": "husky"` script to package.json

### 3. Configure Pre-Commit Hook

Edit `.husky/pre-commit` file:

```bash
#!/usr/bin/env sh
npx lint-staged
```

Or use command:
```bash
echo "npx lint-staged" > .husky/pre-commit
```

### 4. Configure lint-staged

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**For different file types:**

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ],
  "*.css": [
    "prettier --write"
  ]
}
```

### 5. Test the Setup

```bash
# Make a change to a file
echo "const test = 'hello';" >> src/test.ts

# Stage the file
git add src/test.ts

# Try to commit
git commit -m "test husky"

# You should see lint-staged running!
```

## Configuration Examples

### Basic TypeScript Project

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### React Project

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

### Full Stack Project

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ]
  }
}
```

### With Tests

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### Advanced with TypeScript Check

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

## Additional Pre-Commit Hooks

### Pre-Commit with Multiple Checks

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh

# Run lint-staged
npx lint-staged

# Run TypeScript check
npm run ts

# Run tests
npm test
```

### Commit Message Hook

Create `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
npx --no -- commitlint --edit $1
```

Install commitlint:
```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

Create `.commitlintrc.json`:
```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### Pre-Push Hook

Create `.husky/pre-push`:

```bash
#!/usr/bin/env sh

# Run full test suite before push
npm test

# Run build
npm run build
```

## Troubleshooting

### Husky Hooks Not Running

```bash
# Reinstall hooks
npm run prepare

# Or manually
npx husky install
```

### Permission Denied Error

```bash
chmod +x .husky/pre-commit
```

### Skip Hook (Emergency Only)

```bash
# Skip pre-commit hook
git commit -m "message" --no-verify

# Skip pre-push hook
git push --no-verify
```

### Husky Not Working After Clone

Add to README.md:
```markdown
## Setup

After cloning:
```bash
npm install
npm run prepare  # This sets up Husky hooks
```
```

## Package.json Scripts Reference

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "ts": "tsc --noEmit",
    "test": "jest"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Complete Installation Script

Copy-paste this to set up Husky in any project:

```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init

# Configure pre-commit hook
echo "npx lint-staged" > .husky/pre-commit

# Make hook executable
chmod +x .husky/pre-commit

echo "✅ Husky configured! Add lint-staged config to package.json"
```

Then manually add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Best Practices

1. **Keep it Fast**: Only run checks on staged files
2. **Auto-fix When Possible**: Use `--fix` and `--write` flags
3. **Don't Run Heavy Tasks**: Avoid running full test suite in pre-commit
4. **Document for Team**: Add setup instructions to README
5. **CI/CD Backup**: Always have CI checks as backup

## Common Patterns

### Pattern 1: Lint and Format Only
```json
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"]
}
```

### Pattern 2: With Type Check
```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write",
    "bash -c 'tsc --noEmit'"
  ]
}
```

### Pattern 3: With Related Tests
```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write",
    "jest --bail --findRelatedTests"
  ]
}
```

### Pattern 4: Separate by File Type
```json
"lint-staged": {
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.json": ["prettier --write"],
  "*.md": ["prettier --write"]
}
```

## Verification Checklist

- [ ] `husky` and `lint-staged` installed
- [ ] `.husky/pre-commit` file exists and is executable
- [ ] `package.json` has `"prepare": "husky"` script
- [ ] `package.json` has `lint-staged` configuration
- [ ] Test commit shows lint-staged running
- [ ] ESLint and Prettier are working
- [ ] Team members can clone and hooks work

## Resources

- Husky Docs: https://typicode.github.io/husky/
- lint-staged Docs: https://github.com/okonet/lint-staged
- ESLint: https://eslint.org/
- Prettier: https://prettier.io/

---

## Quick Reference

```bash
# Install
npm i -D husky lint-staged

# Init
npx husky init

# Configure
echo "npx lint-staged" > .husky/pre-commit

# Add to package.json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"]
  }
}

# Test
git add . && git commit -m "test"
```

---

**Note**: Always commit the `.husky/` directory to your repository so the hooks work for all team members!
