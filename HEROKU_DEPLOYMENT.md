# Heroku Deployment Guide

## Prerequisites
- Heroku CLI installed
- GitHub repository ready

## Deployment Steps

### 1. Create Heroku App
```bash
heroku create your-app-name
```

### 2. Connect to GitHub
- Go to Heroku Dashboard → Your App → Deploy tab
- Connect to GitHub and select your repository
- Enable automatic deploys from main branch

### 3. Set Config Vars
Set these in Heroku Dashboard (replace with your real values):

```
NODE_ENV=production
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-app-name.herokuapp.com
GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
DATABASE_URL=your-postgresql-database-url
OPENAI_API_KEY=your-openai-api-key
GHL_BASE_URL=https://services.leadconnectorhq.com
HEROKU_APP_NAME=your-app-name
```

### 4. Update GoHighLevel OAuth Settings
- Go to your GoHighLevel app settings
- Add redirect URI: `https://your-app-name.herokuapp.com/api/auth/callback/oauth`

### 5. Deploy
- Push your code to GitHub main branch
- Heroku will automatically build and deploy

## Security Warning
⚠️ **NEVER commit real API keys, secrets, or database URLs to version control!**
⚠️ **Always use environment variables for sensitive data**

## Architecture
- **Web dyno**: Runs both Next.js frontend and Express backend
- **Database**: External Neon PostgreSQL
- **File structure**: Monorepo with client/ and backend/ directories 