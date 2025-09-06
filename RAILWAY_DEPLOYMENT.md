# Railway Deployment Guide for Cat Tracker

## Current Deployment URLs
- Frontend: https://graceful-optimism-production.up.railway.app
- Backend: https://clever-generosity-production.up.railway.app

## Issues Fixed

### 1. CORS Configuration
Updated backend to properly handle CORS for the Railway frontend URL.

### 2. API URL Configuration
Removed hardcoded API URL from frontend and configured proper environment variables.

### 3. Multi-Device Data Synchronization
The app now properly syncs data across devices using the Railway backend.

## Deployment Steps

### Backend Deployment

1. **Push the updated backend code to Railway**
   ```bash
   git add backend/
   git commit -m "Fix CORS configuration for Railway deployment"
   git push
   ```

2. **Set Environment Variables in Railway Backend Service**
   Go to your Railway backend service and add these variables:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://graceful-optimism-production.up.railway.app
   ```

3. **Database Consideration**
   Currently using SQLite which stores data in a file. For better multi-device support, consider:
   - Adding Railway's Postgres database service
   - Railway will automatically provide DATABASE_URL
   - The backend is already configured to use Postgres if DATABASE_URL is present

### Frontend Deployment

1. **Push the updated frontend code to Railway**
   ```bash
   git add .
   git commit -m "Update API configuration for Railway deployment"
   git push
   ```

2. **Set Environment Variables in Railway Frontend Service**
   Go to your Railway frontend service and add:
   ```
   VITE_API_URL=https://clever-generosity-production.up.railway.app/api
   ```

## Testing Multi-Device Functionality

1. Open the app on Device 1: https://graceful-optimism-production.up.railway.app
2. Create or update cat profile and add some entries
3. Open the app on Device 2 (different browser/device)
4. You should see the same data automatically

## Important Notes

### Database Persistence
- SQLite stores data in a file on the server
- If the Railway service restarts, SQLite data might be lost
- **Recommended**: Use Railway's Postgres for persistent storage

### To Add Postgres Database:
1. In Railway dashboard, add a Postgres service
2. Connect it to your backend service
3. Railway automatically provides DATABASE_URL
4. The backend will automatically switch to Postgres

## Troubleshooting

### If data doesn't sync:
1. Check browser console for CORS errors
2. Verify environment variables are set correctly in Railway
3. Check Railway logs for both frontend and backend services
4. Ensure both services are deployed and running

### If you see CORS errors:
1. Verify FRONTEND_URL is set correctly in backend env vars
2. Make sure the frontend URL matches exactly (including https://)
3. Redeploy the backend after setting environment variables

## Local Development

For local development, the default configuration works:
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd ..
npm run dev
```

The app will use http://localhost:3001/api for the backend.