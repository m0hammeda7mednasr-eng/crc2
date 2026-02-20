# Railway Port Configuration Fix

## Problem
Railway deployment shows "Deployment successful" but the domain returns "Not Found" error.

**Deploy logs show:**
```
🚀 Server running on port 8080
```

**But Railway expects port 5000** (or the PORT environment variable Railway sets automatically).

## Root Cause
Railway automatically sets a `PORT` environment variable, but there might be a mismatch between:
1. The port your server is listening on
2. The port Railway's proxy expects

## Solution

### Step 1: Check Railway Environment Variables
1. Go to your Railway project: https://railway.app/project/79e2d5f9-89c3-4b60-bf07-3d59c3d65b5e
2. Click on your backend service
3. Go to "Variables" tab
4. Check if `PORT` is set - **DO NOT manually set PORT**
5. Railway automatically provides PORT - your app should use `process.env.PORT`

### Step 2: Verify Code (Already Fixed)
The code in `backend/src/index.ts` correctly uses:
```typescript
const PORT = process.env.PORT || 5000;
```

This means:
- If Railway sets PORT=8080, server will use 8080
- If no PORT is set, server will use 5000

### Step 3: Check Railway Networking Settings
1. In Railway project, go to "Settings" tab
2. Scroll to "Networking" section
3. Verify the domain is properly configured
4. Railway should automatically handle port mapping

### Step 4: Redeploy
After fixing the `allowedOrigins` error in the code:
```bash
git add backend/src/index.ts
git commit -m "Fix CORS allowedOrigins reference"
git push origin main
```

Railway will automatically redeploy.

### Step 5: Test the Deployment
Once deployed, test these endpoints:
```bash
# Health check
curl https://backend-production-8d86c.up.railway.app/health

# API health check
curl https://backend-production-8d86c.up.railway.app/api/health
```

## Expected Result
After redeployment, you should see:
- ✅ Build successful
- ✅ Deploy successful
- ✅ Server running on port 8080 (or whatever Railway sets)
- ✅ Domain responds with health check data
- ✅ No "Not Found" errors

## If Still Not Working
1. Check Railway logs for any startup errors
2. Verify DATABASE_URL and other environment variables are set
3. Check if Prisma migrations ran successfully
4. Ensure all required environment variables from the list are set

## Required Environment Variables
```
DATABASE_URL=postgresql://postgres.djsybibajbgatdupufri:01066184859Mm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
JWT_SECRET=BD-JF9I$16ejXoS*KdcAtyai8WgN_nm4f?h+vMU=&uEzT0xb
NODE_ENV=production
FRONTEND_URL=https://crc2-backend.vercel.app
```

**DO NOT SET PORT MANUALLY** - Railway handles this automatically.
