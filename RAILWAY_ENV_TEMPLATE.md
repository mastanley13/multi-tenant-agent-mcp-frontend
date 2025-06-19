# Railway Environment Variables Template

Add these to your Railway project dashboard under "Variables":

## 🚨 **REQUIRED FOR PRODUCTION**

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
NEXTAUTH_SECRET=your-super-secret-random-string-here-make-it-long
```

## 🏢 **GOHIGHLEVEL OAUTH**
Get these from GoHighLevel Marketplace → Your App → OAuth Settings:

```env
GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
```

## ✅ **AUTOMATICALLY PROVIDED BY RAILWAY**
These are created automatically - **DO NOT SET MANUALLY**:

```env
# Railway creates these when you add PostgreSQL service
DATABASE_URL=postgresql://user:pass@host:port/db

# Railway provides these for each service
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
```

## 🚀 **OPTIONAL BUT RECOMMENDED**

### Upstash Redis (for production rate limiting)
Create free account at [upstash.com](https://upstash.com):

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Error Monitoring (optional)
```env
SENTRY_DSN=your-sentry-dsn-if-using
```

## 🎯 **How to Add Variables in Railway**

1. Go to your Railway dashboard
2. Select your project
3. Click on each service (frontend, backend, mcp-server)
4. Go to "Variables" tab
5. Add the variables above
6. Click "Deploy" to apply changes

## ⚠️ **Important Notes**

- **NODE_ENV** is set to "production" automatically by Railway
- **Internal networking** between services is handled automatically
- **Database migrations** run automatically on deployment
- **Health checks** are configured in `railway.json`

## 🔐 **Security Best Practices**

- Keep your **OPENAI_API_KEY** secret
- Use a strong **NEXTAUTH_SECRET** (at least 32 characters)
- Never commit these values to git
- Use Railway's environment variables dashboard only 