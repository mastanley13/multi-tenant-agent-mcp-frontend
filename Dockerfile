# Ultra-Simple Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk update && apk upgrade && apk add --no-cache openssl

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only what we need for backend
COPY package*.json ./
COPY client/prisma ./client/prisma
COPY backend/src ./backend/src

# Install dependencies and generate Prisma client
RUN npm install --ignore-scripts --omit=dev
RUN npx prisma generate --schema=./client/prisma/schema.prisma

# Set ownership
RUN chown -R app:app /app
USER app

# Environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=3001

# Expose port
EXPOSE 3001

# Start backend with tsx (no build needed)
CMD ["npx", "tsx", "backend/src/index.ts"] 