# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/mcp-src/package*.json ./backend/mcp-src/

# Copy Prisma schema for client generation
COPY client/prisma ./client/prisma

# Install dependencies without running postinstall scripts
RUN npm install --ignore-scripts --omit=dev

# Generate Prisma client
RUN npx prisma generate --schema=./client/prisma/schema.prisma

# Copy source code
COPY backend ./backend

# Build MCP server
WORKDIR /app/backend/mcp-src
RUN npm ci && npm run build

# Runtime stage
FROM node:20-alpine

# Install OpenSSL for Prisma and database connections
RUN apk update && apk upgrade && apk add --no-cache openssl

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy built application
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/mcp-src/dist ./backend/mcp-src/dist
COPY --from=builder /app/client/prisma ./client/prisma

# Set ownership
RUN chown -R app:app /app
USER app

# Environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=3001

# Expose port
EXPOSE 3001

# Start the backend server
CMD ["npx", "tsx", "backend/src/index.ts"] 