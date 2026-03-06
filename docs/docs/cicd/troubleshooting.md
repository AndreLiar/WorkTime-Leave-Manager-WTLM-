---
sidebar_position: 5
title: Troubleshooting Guide
description: Common CI/CD issues and their solutions
---

# 🔧 CI/CD Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common CI/CD pipeline issues.

---

## 🔴 CI Pipeline Failures

### Problem: TypeScript Compilation Errors

**Symptoms:**
```
Error: TS2307: Cannot find module '@/utils/date'
```

**Causes:**
- Missing TypeScript dependencies
- Path alias misconfiguration
- Type definition errors

**Solutions:**

1. **Check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Install missing types:**
   ```bash
   npm install --save-dev @types/node @types/express
   ```

3. **Clear cache and rebuild:**
   ```bash
   npm run clean
   npm ci
   npm run ts
   ```

---

### Problem: ESLint Failures

**Symptoms:**
```
Error: Expected semicolon (semi)
Error: Unused variable 'userId' (no-unused-vars)
```

**Causes:**
- Code style violations
- Outdated ESLint config
- Auto-fix not applied

**Solutions:**

1. **Auto-fix locally:**
   ```bash
   npm run lint:fix
   git add .
   git commit -m "style: Fix linting errors"
   ```

2. **Check ESLint config:**
   ```javascript
   // eslint.config.mjs
   export default [
     {
       rules: {
         'semi': ['error', 'always'],
         'no-unused-vars': 'warn'
       }
     }
   ];
   ```

3. **Skip specific rules (use sparingly):**
   ```javascript
   // eslint-disable-next-line no-unused-vars
   const unused = 'value';
   ```

---

### Problem: Unit Test Failures

**Symptoms:**
```
FAIL src/services/leave.service.test.ts
  ● LeaveService › should calculate leave balance
    Expected: 15
    Received: 10
```

**Causes:**
- Test data inconsistency
- Async timing issues
- Mock configuration errors

**Solutions:**

1. **Run tests locally:**
   ```bash
   npm run test:unit
   npm run test:unit -- --watch
   ```

2. **Check test isolation:**
   ```javascript
   beforeEach(() => {
     // Reset mocks
     jest.clearAllMocks();
     
     // Reset database state
     prisma.leave.deleteMany();
   });
   ```

3. **Fix async issues:**
   ```javascript
   // Bad
   test('should create leave', () => {
     service.createLeave(data);
     expect(result).toBeDefined();
   });
   
   // Good
   test('should create leave', async () => {
     const result = await service.createLeave(data);
     expect(result).toBeDefined();
   });
   ```

---

### Problem: Build Failures

**Symptoms:**
```
Error: Cannot resolve module 'prisma/client'
Error: Out of memory
```

**Causes:**
- Missing Prisma generation
- Insufficient memory
- Dependency conflicts

**Solutions:**

1. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   npm run build
   ```

2. **Increase Node memory:**
   ```json
   {
     "scripts": {
       "build": "NODE_OPTIONS='--max-old-space-size=4096' nest build"
     }
   }
   ```

3. **Clear build cache:**
   ```bash
   rm -rf dist node_modules
   npm ci
   npm run build
   ```

---

### Problem: Gitleaks Secret Detection

**Symptoms:**
```
Error: Secret detected in commit abc1234
  Line 15: AWS_SECRET_KEY=abc123def456
```

**Causes:**
- Hardcoded credentials
- API keys in code
- Accidental commit of .env

**Solutions:**

1. **Remove secrets:**
   ```bash
   # Edit the file
   git add file.ts
   git commit -m "fix: Remove hardcoded secret"
   ```

2. **Use environment variables:**
   ```typescript
   // Bad
   const apiKey = 'sk_live_abc123';
   
   // Good
   const apiKey = process.env.API_KEY;
   ```

3. **Add to .gitignore:**
   ```
   .env
   .env.local
   secrets/
   *.key
   *.pem
   ```

4. **If already committed:**
   ```bash
   # Rotate the compromised secret immediately!
   # Then clean git history (requires force push)
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch path/to/secret' \
     --prune-empty --tag-name-filter cat -- --all
   ```

---

## 🟡 Staging Validation Failures

### Problem: Integration Tests Fail

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Test timeout after 30000ms
```

**Causes:**
- PostgreSQL service not ready
- Database connection string wrong
- Migrations not applied

**Solutions:**

1. **Check service health:**
   ```yaml
   services:
     postgres:
       options: >-
         --health-cmd pg_isready
         --health-interval 10s
   ```

2. **Wait for database:**
   ```bash
   timeout 30 bash -c 'until pg_isready -h localhost; do sleep 1; done'
   ```

3. **Verify DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://user:password@localhost:5432/dbname
   ```

4. **Run migrations:**
   ```bash
   npm run prisma:migrate:deploy
   ```

---

### Problem: E2E Tests Fail

**Symptoms:**
```
Error: Cannot connect to http://localhost:3000
Newman run failed with 5 errors
```

**Causes:**
- Application not started
- Port already in use
- Docker compose issues

**Solutions:**

1. **Check application logs:**
   ```bash
   docker-compose logs app
   ```

2. **Verify port availability:**
   ```bash
   lsof -i :3000
   # Kill existing process if needed
   kill -9 <PID>
   ```

3. **Start application manually:**
   ```bash
   npm run start &
   sleep 10
   curl http://localhost:3000/health
   ```

4. **Check Newman collection:**
   ```bash
   newman run WorkTime-Leave-Manager.postman_collection.json \
     --env-var "baseUrl=http://localhost:3000" \
     --verbose
   ```

---

### Problem: CodeQL Analysis Fails

**Symptoms:**
```
Error: Could not find JavaScript database
Warning: 150 results found
```

**Causes:**
- Language detection issues
- Security vulnerabilities found
- Analysis timeout

**Solutions:**

1. **Check language configuration:**
   ```yaml
   - uses: github/codeql-action/init@v3
     with:
       languages: javascript-typescript
   ```

2. **Review findings:**
   - Go to Security → Code scanning alerts
   - Review each alert
   - Fix genuine issues
   - Dismiss false positives with justification

3. **Increase timeout:**
   ```yaml
   - uses: github/codeql-action/analyze@v3
     with:
       category: "/language:javascript-typescript"
     timeout-minutes: 30
   ```

---

### Problem: Trivy Container Scan Failures

**Symptoms:**
```
CRITICAL: CVE-2024-1234 in express@4.17.1
HIGH: CVE-2024-5678 in lodash@4.17.20
```

**Causes:**
- Vulnerable dependencies
- Outdated base image
- Security patches needed

**Solutions:**

1. **Update dependencies:**
   ```bash
   npm audit fix
   npm update
   ```

2. **Check specific vulnerability:**
   ```bash
   npm audit
   # Review each CVE
   # Update or replace affected packages
   ```

3. **Update base image:**
   ```dockerfile
   # In Dockerfile
   FROM node:20-alpine  # Use latest LTS
   ```

4. **Accept risk (document why):**
   ```yaml
   - name: Trivy scan
     continue-on-error: true  # Only if justified
   ```

---

## 🔴 CD Pipeline Failures

### Problem: Docker Build Fails

**Symptoms:**
```
Error: failed to solve with frontend dockerfile.v0
Error: COPY failed: no source files were specified
```

**Causes:**
- Missing files in context
- Invalid Dockerfile syntax
- Build context too large

**Solutions:**

1. **Check Dockerfile:**
   ```dockerfile
   # Ensure all COPY paths exist
   COPY package*.json ./
   COPY prisma ./prisma/
   COPY src ./src/
   ```

2. **Verify .dockerignore:**
   ```
   node_modules
   dist
   .git
   *.log
   ```

3. **Test build locally:**
   ```bash
   docker build -t test-image .
   docker run -p 3000:3000 test-image
   ```

---

### Problem: Render Deployment Fails

**Symptoms:**
```
Error: Render deployment failed with status: build_failed
Error: Could not extract deployment ID
```

**Causes:**
- Missing environment variables
- Build command failed
- Insufficient resources

**Solutions:**

1. **Check Render dashboard:**
   - Go to https://dashboard.render.com/
   - Select your service
   - View build logs

2. **Verify environment variables:**
   ```yaml
   Required secrets:
   - DATABASE_URL
   - NODE_ENV=production
   - PORT=3000
   ```

3. **Check build command:**
   ```yaml
   # In render.yaml
   buildCommand: npm ci && npm run build
   startCommand: npm run start:prod
   ```

4. **Review resource limits:**
   - Check if plan has sufficient memory
   - Monitor CPU usage
   - Consider upgrading plan

---

### Problem: Smoke Tests Fail After Deployment

**Symptoms:**
```
Error: Health check failed
Error: Connection timeout
```

**Causes:**
- Application not fully started
- Database connection issues
- Missing environment variables

**Solutions:**

1. **Check application logs:**
   ```bash
   # In Render dashboard
   Logs → Recent logs
   ```

2. **Verify health endpoint:**
   ```bash
   curl -v https://your-app.onrender.com/health
   ```

3. **Check database connectivity:**
   ```bash
   # In Render shell
   npm run prisma:studio
   # or
   psql $DATABASE_URL
   ```

4. **Increase timeout:**
   ```yaml
   - name: Run smoke tests
     run: |
       # Wait longer for cold start
       sleep 30
       curl --max-time 30 $APP_URL/health
   ```

---

### Problem: Automatic Rollback Fails

**Symptoms:**
```
Error: No previous version found for rollback
Error: Could not trigger Render deployment
```

**Causes:**
- No previous version tagged
- Docker image not available
- Render API key missing

**Solutions:**

1. **Check version tags:**
   ```bash
   git tag --sort=-creatordate | head -10
   ```

2. **Verify Docker image:**
   ```bash
   docker pull ghcr.io/your-repo/app:previous-version
   ```

3. **Use manual rollback:**
   - Go to GitHub Actions
   - Run CD workflow
   - Select "rollback" action
   - Specify version manually

4. **Direct Render rollback:**
   - Go to Render dashboard
   - Click service → Rollback
   - Select previous deployment

---

## 🟢 Branch Protection Issues

### Problem: Cannot Push to Protected Branch

**Symptoms:**
```
error: GH006: Protected branch update failed
Changes must be made through a pull request
```

**Cause:** Branch protection rules working as intended

**Solution:**

1. **Create feature branch:**
   ```bash
   git checkout -b feature/my-change
   git push origin feature/my-change
   ```

2. **Create PR:**
   - Go to GitHub
   - Click "Compare & pull request"
   - Select correct base branch

---

### Problem: PR Requires Approvals

**Symptoms:**
```
Error: Review required before merging
Need 1 approval
```

**Cause:** Branch protection configured for approvals

**Solution:**

1. **Request review:**
   - In PR, click "Reviewers"
   - Select team member
   - Wait for approval

2. **Emergency bypass (use sparingly):**
   - Repository settings
   - Branches
   - Edit rule
   - Temporarily disable "Include administrators"

---

## 📊 Performance Issues

### Problem: CI Pipeline Too Slow

**Symptoms:**
- Develop PR: > 15 minutes
- Staging: > 30 minutes
- Main PR: > 10 minutes

**Solutions:**

1. **Enable caching:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```

2. **Parallelize jobs:**
   ```yaml
   jobs:
     lint:
       runs-on: ubuntu-latest
     test:
       runs-on: ubuntu-latest
     # Both run in parallel
   ```

3. **Skip unnecessary steps:**
   ```yaml
   - name: Build
     if: github.base_ref != 'main'  # Skip for main PRs
   ```

4. **Use GitHub Actions cache:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: node_modules
       key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
   ```

---

### Problem: Deployments Take Too Long

**Symptoms:**
- Deployment: > 20 minutes
- Cold start: > 2 minutes

**Solutions:**

1. **Optimize Docker image:**
   ```dockerfile
   # Use multi-stage builds
   FROM node:20-alpine AS builder
   # ... build steps
   
   FROM node:20-alpine
   COPY --from=builder /app/dist ./dist
   ```

2. **Reduce image size:**
   ```dockerfile
   # Remove dev dependencies
   RUN npm ci --only=production
   
   # Clean cache
   RUN npm cache clean --force
   ```

3. **Use smaller base image:**
   ```dockerfile
   FROM node:20-alpine  # vs node:20 (saves ~200MB)
   ```

---

## 🔍 Debugging Tools

### View Logs

```bash
# GitHub Actions logs
gh run view <run-id> --log

# Render logs (in dashboard)
# Or via CLI
render logs --service <service-id>

# Docker logs
docker logs <container-id>
```

### Test Locally

```bash
# Test CI steps locally with act
act pull_request

# Test Dockerfile
docker build -t test .
docker run test

# Test integration
docker-compose up
npm run test:integration
```

### SSH into Render (if enabled)

```bash
render ssh <service-id>
# Then run diagnostic commands
ps aux
df -h
free -m
```

---

## 📞 Escalation Process

### Level 1: Self-Service (0-30 min)
- Check this troubleshooting guide
- Review workflow logs
- Search GitHub issues
- Check documentation

### Level 2: Team Support (30-60 min)
- Ask in team Slack channel
- Check with on-call engineer
- Review recent changes

### Level 3: External Support (> 60 min)
- GitHub Support (for Actions issues)
- Render Support (for deployment issues)
- Create detailed issue report

---

## 📚 Related Documentation

- [Rollback Playbook](./rollback-playbook.md)
- [CI/CD Overview](./overview.md)
- [Developer Workflow](./developer-workflow.md)

---

**Last Updated:** 2024-03-05  
**Version:** 1.0
