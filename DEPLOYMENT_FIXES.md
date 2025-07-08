# Render Deployment Fixes

## Issues Fixed

### 1. Sentry Initialization Error
**Problem**: `ReferenceError: Sentry is not defined` and module compatibility issues
**Solution**: 
- Uncommented Sentry import in `server/server.js`
- Downgraded Sentry to v7.114.0 for compatibility
- Removed incompatible `@sentry/integrations` package
- Updated Sentry configuration for v7.x API
- Added conditional Sentry usage (only when SENTRY_DSN is set)

### 2. Environment Variables Path Issue
**Problem**: Server was looking for `.env` file at hardcoded Windows path `D:\AMessages\server\.env`
**Solution**:
- Updated `server/utils/startupChecks.js` to use dynamic path resolution
- Modified `server/server.js` to look for `.env` file in root directory
- Made environment variable checks non-fatal (warnings instead of errors)

### 3. CORS Configuration
**Problem**: Hardcoded `http://localhost:3000` as CORS origin
**Solution**:
- Updated CORS settings to use `process.env.FRONTEND_URL` with fallback
- Applied to both Express CORS and Socket.IO CORS settings

## Environment Variables Setup on Render

### Backend Environment Variables

Set these in your **backend** Render dashboard under **Environment** section:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
FRONTEND_URL=https://amessages-frontend.onrender.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SENTRY_DSN=your-sentry-dsn-or-leave-empty
DB_HOST=localhost
DB_PORT=27017
DB_NAME=amessages
```

### Frontend Environment Variables

Set these in your **frontend** Render dashboard under **Environment** section:

```
NEXT_PUBLIC_API_URL=https://amessages.onrender.com
NODE_ENV=production
```

### Important Notes

1. **FRONTEND_URL**: Must be set to your actual frontend URL on Render
2. **JWT_SECRET**: Use a strong, unique secret key
3. **GOOGLE_CLIENT_ID/SECRET**: Configure for your Google OAuth app
4. **SENTRY_DSN**: Optional - can be left empty if not using Sentry

### Backend Render Dashboard Setup

1. Go to your **backend** Render service dashboard
2. Navigate to **Environment** tab
3. Add each backend environment variable listed above
4. Save changes
5. Redeploy your service

### Frontend Render Dashboard Setup

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set **Root Directory** to `client`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Start Command** to `npm start`
6. Navigate to **Environment** tab
7. Add each frontend environment variable listed above
8. Save changes
9. Deploy your service

## File Changes Made

### server/server.js
- Fixed Sentry import and initialization
- Updated Sentry configuration for v7.x compatibility
- Updated dotenv configuration to use proper path
- Updated CORS settings to use environment variables
- Added conditional Sentry usage

### server/package.json
- Downgraded @sentry/node to v7.114.0
- Removed incompatible @sentry/integrations package

### server/utils/startupChecks.js
- Replaced hardcoded Windows paths with dynamic path resolution
- Made .env file check non-fatal
- Made JWT_SECRET check non-fatal

## Testing Deployment

After setting up environment variables:

1. Check Render logs for any remaining errors
2. Verify that server starts without Sentry errors
3. Test CORS functionality with your frontend
4. Verify database initialization works correctly

## Troubleshooting

### If server still fails to start:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure FRONTEND_URL matches your actual frontend URL
4. Check that JWT_SECRET is properly configured

### If CORS errors occur:
1. Verify FRONTEND_URL is set correctly
2. Check that frontend is making requests to the correct backend URL
3. Ensure both Express and Socket.IO CORS settings are correct 