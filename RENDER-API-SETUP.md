# Render API Setup Guide

This guide explains how to configure Render API credentials for accurate deployment verification in the CD pipeline.

## Why Use Render API?

The CD pipeline now supports two methods for verifying deployments:

1. **Render API (Recommended)** - Polls the actual deployment status from Render
2. **Health Check Fallback** - Checks if the app responds (may report success prematurely)

The Render API method ensures the CD pipeline waits for the **new deployment** to complete, not just any version of your app.

## Setup Instructions

### Step 1: Get Your Render API Key

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Go to **Account Settings** (click your avatar → Account Settings)
3. Scroll to **API Keys** section
4. Click **Create API Key**
5. Give it a name (e.g., "GitHub Actions CD Pipeline")rnd_jYZXE9UZwl1Zkqn16cUxG0QMkmoV
6. Copy the generated API key (starts with `rnd_`)

⚠️ **Important**: Save this key immediately - you won't be able to see it again!

### Step 2: Get Your Render Service ID

1. Go to your service in [Render Dashboard](https://dashboard.render.com/)
2. Click on your **worktime-leave-manager** service
3. Look at the URL in your browser:
   ```
   https://dashboard.render.com/web/srv-XXXXXXXXXXXXX
                                        ^^^^^^^^^^^^^^^^
                                        This is your Service ID
   ```
4. Copy the service ID (starts with `srv-`) srv-d67gl6mmcj7s739d78o0

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   | Secret Name | Value | Example |
   |-------------|-------|---------|
   | `RENDER_API_KEY` | Your Render API key | `rnd_abcd1234...` |
   | `RENDER_SERVICE_ID` | Your service ID | `srv-abcd1234...` |

### Step 4: Verify Existing Secrets

Make sure you also have these secrets configured:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RENDER_DEPLOY_HOOK` | Deploy webhook URL | Render Dashboard → Service → Settings → Deploy Hook |
| `RENDER_APP_URL` | Your app URL (fallback) | `https://worktime-leave-manager-wtlm.onrender.com` |

## How It Works

### With Render API (Recommended)

```
Trigger Deploy → Poll Render API every 15s → Check status → Success/Fail
                                              ├─ live ✅
                                              ├─ build_failed ❌
                                              ├─ update_failed ❌
                                              └─ building... ⏳ (keep polling)
```

**Advantages:**
- ✅ Accurately waits for the **new** deployment
- ✅ Detects build failures immediately
- ✅ Shows real deployment status
- ✅ Timeout after 20 minutes (80 attempts × 15s)

### Without Render API (Fallback)

```
Trigger Deploy → Check /health every 15s → If responds → Success
```

**Disadvantages:**
- ⚠️ May detect **old** deployment still running
- ⚠️ Cannot distinguish between old and new version
- ⚠️ May report success while new deployment is still building

## Troubleshooting

### "Cannot verify deployment without API key or app URL"

**Solution**: Add `RENDER_API_KEY` + `RENDER_SERVICE_ID` secrets to your repository.

### "Deployment verification timeout"

**Possible causes:**
1. Render deployment taking longer than 20 minutes
2. Build or deployment failed
3. Service not starting properly

**Steps:**
1. Check [Render Dashboard](https://dashboard.render.com/) for deployment status
2. View service logs for errors
3. Verify Dockerfile builds correctly locally

### "Deployment failed with status: build_failed"

**Solution**: 
1. Check Render logs in the dashboard
2. Fix the build errors in your code/Dockerfile
3. Push the fix to trigger a new deployment

## API Response Examples

### Successful Deployment

```json
{
  "id": "dep-abc123",
  "status": "live",
  "createdAt": "2026-02-13T15:10:39Z",
  "finishedAt": "2026-02-13T15:15:42Z"
}
```

### Failed Deployment

```json
{
  "id": "dep-abc123",
  "status": "build_failed",
  "createdAt": "2026-02-13T15:10:39Z",
  "finishedAt": "2026-02-13T15:12:15Z"
}
```

## Deployment Status Values

| Status | Description | CD Action |
|--------|-------------|-----------|
| `building` | Docker image is being built | Keep polling ⏳ |
| `deploying` | Deployment in progress | Keep polling ⏳ |
| `live` | Successfully deployed | Success ✅ |
| `build_failed` | Build failed | Fail immediately ❌ |
| `update_failed` | Deployment failed | Fail immediately ❌ |
| `deactivated` | Service deactivated | Fail immediately ❌ |

## References

- [Render API Documentation](https://api-docs.render.com/)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
