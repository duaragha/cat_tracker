# Database Fix Instructions for Railway Deployment

## The Problem
Your Railway deployment is using PostgreSQL but the tables were created with the wrong schema (UUID instead of TEXT for IDs), causing data not to save properly.

## The Solution
I've created a complete fix that includes:
1. Updated database abstraction layer to handle PostgreSQL properly
2. Fixed table schemas to use TEXT IDs
3. Added proper RETURNING clauses for INSERT/UPDATE operations
4. Created a migration script to fix existing tables

## Deployment Steps

### Step 1: Push the Updated Code
```bash
git add .
git commit -m "Fix PostgreSQL database schema and query handling"
git push
```

### Step 2: Run the Database Migration on Railway

#### Option A: Using Railway CLI (Recommended)
1. Install Railway CLI if you haven't:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your backend project:
   ```bash
   railway link
   ```

4. Run the migration:
   ```bash
   railway run npm run db:fix
   ```

#### Option B: Using Railway Console
1. Go to your Railway backend service dashboard
2. Click on the "Console" tab
3. Run:
   ```bash
   npm run db:fix
   ```

This will:
- Drop all existing tables (data will be lost, but it wasn't saving anyway)
- Recreate all tables with the correct schema
- Your app will now properly save data

### Step 3: Verify Environment Variables
Make sure these are set in your Railway services:

**Backend Service:**
- `DATABASE_URL` (automatically provided by Railway Postgres)
- `NODE_ENV=production`
- `FRONTEND_URL=https://graceful-optimism-production.up.railway.app`

**Frontend Service:**
- `VITE_API_URL=https://clever-generosity-production.up.railway.app/api`

### Step 4: Test the Application
1. Open https://graceful-optimism-production.up.railway.app
2. Create a cat profile with an image
3. Add a weight entry
4. Refresh the page - data should persist
5. Open on another device - data should be there

## What Changed

### Database Schema
- Changed all ID columns from UUID to TEXT
- Fixed photos columns to use TEXT instead of TEXT[]
- Ensured boolean fields are properly handled

### Database Abstraction Layer
- Added proper PostgreSQL support with RETURNING clauses
- Fixed parameter placeholder conversion (? to $1, $2, etc.)
- Added proper error handling and logging
- Automatic switching between SQLite (local) and PostgreSQL (Railway)

### Server Code
- Updated to use the new database abstraction layer
- No changes needed to API endpoints

## Troubleshooting

### If migration fails:
1. Check Railway logs for the exact error
2. Ensure DATABASE_URL is set (Railway should provide this automatically)
3. Make sure PostgreSQL service is running

### If data still doesn't save after migration:
1. Check browser console for errors
2. Check Railway backend logs
3. Verify CORS is working (no CORS errors in browser)
4. Ensure all environment variables are set correctly

### To check if using PostgreSQL:
Look for this in your Railway backend logs:
```
Database mode: PostgreSQL
DATABASE_URL: Set
PostgreSQL database initialized successfully
```

## Important Notes
- The migration will DROP all existing tables and recreate them
- This is a one-time fix - after running, your data will persist properly
- The app automatically uses PostgreSQL on Railway and SQLite locally
- No further action needed after the migration completes successfully