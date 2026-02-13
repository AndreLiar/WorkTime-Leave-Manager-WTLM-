# CD Setup Guide

## Prerequisites
1. GitHub repository with GitHub Actions enabled
2. Render account (Hobby plan)
3. Docker image registry access (using GitHub Container Registry)

## Setup Steps

### 1. Configure GitHub Container Registry (GHCR)

GitHub Container Registry is free for public repositories. The workflow uses `GITHUB_TOKEN` which is automatically available.

**Make your packages public:**
1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Under "Workflow permissions", ensure "Read and write permissions" is selected
4. After the first workflow run, go to your GitHub profile → "Packages"
5. Find your package and change visibility to "Public" if needed

### 2. Set Up Render Web Service

#### Option A: Deploy from Docker Registry (Recommended)
1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Choose "Deploy an existing image from a registry"
4. Enter your image URL: `ghcr.io/<your-username>/worktime-leave-manager-wtlm-:latest`
   - Replace `<your-username>` with your GitHub username (lowercase)
5. Configure the service:
   - **Name**: `worktime-leave-manager`
   - **Region**: Choose closest to you
   - **Instance Type**: Free (or Starter for $7/month for better performance)
   - **Environment Variables**: Add any required env vars (e.g., `NODE_ENV=production`)
6. Click "Create Web Service"

#### Option B: Deploy from GitHub Repository
1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `worktime-leave-manager`
   - **Runtime**: Docker
   - **Instance Type**: Free or Starter
   - **Docker Command**: Leave empty (uses Dockerfile CMD)
5. Click "Create Web Service"

### 3. Get Render Deploy Hook

1. In your Render service dashboard, go to "Settings"
2. Scroll down to "Deploy Hook"
3. Copy the deploy hook URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### 4. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

   **Secret 1: Deploy Hook**
   - **Name**: `RENDER_DEPLOY_HOOK`
   - **Value**: Paste the Render deploy hook URL from step 3
   - Click "Add secret"
   
   **Secret 2: App URL (Optional but Recommended)**
   - **Name**: `RENDER_APP_URL`
   - **Value**: Your Render app URL (e.g., `https://your-app.onrender.com`)
   - Click "Add secret"
   
   This enables automatic deployment verification and displays the app URL in workflow logs.

## How It Works

### CI Pipeline (`.github/workflows/ci.yml`)
Runs on every pull request to `main`:
- ✅ TypeScript type checking
- ✅ ESLint code quality
- ✅ Unit tests
- ✅ Build verification

### CD Pipeline (`.github/workflows/cd.yml`)
Runs when a pull request is **merged** to `main`:
1. 🐳 Builds Docker image using multi-stage build
2. 📦 Pushes image to GitHub Container Registry with tags:
   - `latest` - most recent production build
   - `<branch>-<sha>` - specific commit reference
   - `pr-<number>` - pull request reference
3. 🚀 Triggers Render deployment via webhook
4. Render pulls the new image and deploys automatically

## Environment Variables on Render

Add any required environment variables in Render dashboard:
- `NODE_ENV=production`
- `PORT=3000` (Render automatically sets this)
- Any database URLs or API keys your app needs

## Verifying Deployment

After merging a PR:
1. Check GitHub Actions tab for workflow status
2. Monitor Render dashboard for deployment progress
3. Once deployed, visit your Render app URL
4. Test the endpoints:
   - `GET /` - Application info
   - `GET /health` - Health check

## Troubleshooting

### Docker Image Not Found
- Ensure GHCR package visibility is set to "Public"
- Check image URL format: `ghcr.io/<username>/<repo>:latest` (all lowercase)

### Render Deploy Hook Not Working
- Verify the secret is correctly added to GitHub
- Check the deploy hook URL is complete and correct
- Review Render logs for error messages

### Build Failures
- Check GitHub Actions logs for specific errors
- Ensure Dockerfile builds successfully locally: `docker build -t test .`
- Verify all dependencies are in package.json

## Cost Information

**GitHub Container Registry**: Free for public repositories
**Render Hobby Plan**:
- Free tier: Limited hours per month, sleeps after inactivity
- Starter ($7/month): Always on, better performance, 512MB RAM
- Essential ($25/month): 2GB RAM, more resources

## Alternative: Docker Hub

If you prefer Docker Hub over GHCR, update `.github/workflows/cd.yml`:

```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

Then add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` to GitHub secrets.
