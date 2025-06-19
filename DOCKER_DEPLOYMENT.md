# Docker Deployment Guide

This guide explains how to deploy the GHL Multi-Tenant Agent using Docker containers.

## Overview

The application has been repackaged into separate Docker containers:
- **Backend Container**: Node.js backend with Express and Socket.io
- **Frontend Container**: Next.js frontend application

## Prerequisites

1. **Docker Desktop** installed and running
2. **Docker Compose** installed (usually comes with Docker Desktop)
3. **Environment variables** configured (see Environment Setup below)

## Quick Start

### For Windows (PowerShell):
```powershell
# Deploy development environment
.\scripts\deploy.ps1 -Command dev

# Deploy production environment
.\scripts\deploy.ps1 -Command prod

# View logs
.\scripts\deploy.ps1 -Command logs -Environment dev

# Stop services
.\scripts\deploy.ps1 -Command stop -Environment dev
```

### For Linux/Mac (Bash):
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy development environment
./scripts/deploy.sh dev

# Deploy production environment
./scripts/deploy.sh prod

# View logs
./scripts/deploy.sh logs

# Stop services
./scripts/deploy.sh stop
```

## Manual Docker Commands

### Development Environment
```bash
# Build and start development containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production Environment
```bash
# Build and start production containers
docker-compose -f deploy/docker-compose.prod.yml up --build -d

# View logs
docker-compose -f deploy/docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f deploy/docker-compose.prod.yml down
```

## Environment Setup

Create a `.env` file in the root directory with your configuration:

```env
# Backend Configuration
NODE_ENV=development
BACKEND_PORT=3001
CLIENT_URL=http://localhost:3000

# GoHighLevel Configuration
GHL_BASE_URL=https://services.leadconnectorhq.com

# OpenAI Configuration (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (if using a database)
DATABASE_URL=your_database_url_here

# NextAuth Configuration (for authentication)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Frontend Configuration
NEXT_PUBLIC_MCP_URL=http://localhost:3001
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

## Container Architecture

### Backend Container (Port 3001)
- **Base Image**: `node:20-alpine`
- **Purpose**: API server, Socket.io, MCP tools
- **Health Check**: `/health` endpoint
- **Environment**: Production-optimized with security user

### Frontend Container (Port 3000)
- **Base Image**: `node:20-alpine`
- **Purpose**: Next.js application serving the web interface
- **Depends On**: Backend container health check
- **Environment**: Production build with optimizations

## Service URLs

### Development Environment
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Metrics**: http://localhost:3001/metrics

### Production Environment
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Metrics**: http://localhost:3001/metrics

## Troubleshooting

### Container Won't Start
1. Check Docker is running: `docker info`
2. Check container logs: `docker-compose logs [service-name]`
3. Verify environment variables are set correctly
4. Ensure ports 3000 and 3001 are available

### Build Errors
1. Clear Docker build cache: `docker system prune -a`
2. Remove existing containers: `docker-compose down -v`
3. Rebuild: `docker-compose up --build`

### Database Connection Issues
1. Ensure `DATABASE_URL` is set correctly
2. For production, uncomment the database service in `docker-compose.prod.yml`
3. Run database migrations: `docker-compose exec frontend npm run db:migrate`

### Permission Issues
- Containers run as non-root user `app` for security
- If you encounter permission issues, check volume mounts

## Production Deployment

For production deployment:

1. **Set Environment Variables**:
   ```bash
   export CLIENT_URL=https://your-domain.com
   export BACKEND_URL=https://your-api-domain.com
   export NEXTAUTH_URL=https://your-domain.com
   ```

2. **Configure SSL/TLS**: Use a reverse proxy like Nginx or Traefik

3. **Database**: Use a managed database service or deploy PostgreSQL container

4. **Monitoring**: Enable metrics endpoint and configure monitoring

## Docker Images

The deployment creates the following images:
- `ghl/backend:latest` - Backend service
- `ghl/frontend:latest` - Frontend service

## Security Features

- ✅ Non-root user execution
- ✅ Minimal Alpine Linux base images
- ✅ Health checks for service monitoring
- ✅ Security headers via Helmet.js
- ✅ CORS configuration
- ✅ Rate limiting support

## Next Steps

1. Configure your environment variables
2. Set up monitoring and logging
3. Configure SSL certificates for production
4. Set up automated backups if using a database
5. Configure CI/CD pipeline for automated deployments

For more information, see the main README.md or contact support. 