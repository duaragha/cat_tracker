# Railway Deployment Guide for Cat Tracker

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy Backend with Database

1. **Login to Railway** at https://railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select your `cat_tracker` repository

3. **Add PostgreSQL Database**
   - In your project, click "New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create a Postgres instance

4. **Deploy Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repository again
   - In settings, set the **Root Directory** to `/backend`
   - Railway will auto-detect Node.js and use the railway.json config

5. **Configure Backend Environment Variables**
   - Click on your backend service
   - Go to "Variables" tab
   - Railway auto-injects database variables, but add:
     ```
     NODE_ENV=production
     PORT=3001
     FRONTEND_URL=https://YOUR-FRONTEND-APP.railway.app
     ```
   - The DATABASE_URL will be automatically provided by Railway

6. **Generate Backend Domain**
   - Go to Settings → Domains
   - Click "Generate Domain"
   - Copy this URL (you'll need it for frontend config)

### 3. Deploy Frontend

1. **Create Another Service** in the same project
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Leave **Root Directory** as `/` (root)

2. **Configure Frontend Environment Variables**
   - Click on your frontend service
   - Go to "Variables" tab
   - Add:
     ```
     VITE_API_BASE_URL=https://YOUR-BACKEND-URL.railway.app/api
     ```
   - Replace YOUR-BACKEND-URL with the actual backend domain from step 2.6

3. **Generate Frontend Domain**
   - Go to Settings → Domains
   - Click "Generate Domain"

4. **Update Backend CORS**
   - Go back to your backend service
   - Update the FRONTEND_URL variable with your actual frontend domain

### 4. Monitor Deployment

- Click on each service to see build logs
- Wait for both services to show "Success"
- Your app will be live at the frontend URL!

## Environment Variables Summary

### Backend Variables (auto-provided + custom)
- `DATABASE_URL` - Auto-provided by Railway
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - Auto-provided
- `NODE_ENV=production`
- `PORT=3001`
- `FRONTEND_URL=https://your-frontend.railway.app`

### Frontend Variables
- `VITE_API_BASE_URL=https://your-backend.railway.app/api`

## Useful Railway CLI Commands (Optional)

Install Railway CLI:
```bash
npm install -g @railway/cli
```

Login and link project:
```bash
railway login
railway link
```

Deploy from command line:
```bash
railway up
```

View logs:
```bash
railway logs
```

## Troubleshooting

1. **Build Failures**
   - Check build logs in Railway dashboard
   - Ensure all dependencies are in package.json
   - Check Node version compatibility

2. **Database Connection Issues**
   - Railway provides DATABASE_URL automatically
   - Use the internal connection string for better performance
   - Check that your backend code handles DATABASE_URL

3. **CORS Errors**
   - Ensure FRONTEND_URL is set correctly in backend
   - Check that backend allows the frontend domain

4. **Environment Variables Not Working**
   - Restart the service after adding variables
   - Check variable names match exactly in code

## Costs

Railway offers:
- $5 free credits per month
- Hobby plan at $5/month for more resources
- Your cat tracker should run fine on the free tier initially

## Next Steps

After deployment:
1. Test all features on the live site
2. Set up a custom domain (optional)
3. Configure monitoring/alerts in Railway
4. Set up automatic deploys from GitHub

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository's issues section