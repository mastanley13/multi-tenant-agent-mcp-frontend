# -------- Stage 1: dependencies & build --------
FROM node:20-alpine AS builder

# Use root in builder stage to avoid permission issues during npm installs inside nested dirs

WORKDIR /app

# Root package
COPY package*.json ./
RUN npm ci

# Copy backend source (only TypeScript we need)
COPY backend ./backend
# MCP submodule
COPY backend/mcp-src ./backend/mcp-src
# Skip pre-compiling backend TypeScript – tsx will transpile on-the-fly at runtime
# (avoids ERR_MODULE_NOT_FOUND issue seen during `tsx build` in CI)

# Build MCP server (outputs dist inside mcp-src)
RUN cd backend/mcp-src && npm ci && npm run build && cd /app

# -------- Stage 2: runtime image --------
FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app

# Copy backend source
COPY --from=builder /app/backend /app/backend
# Copy installed node modules
COPY --from=builder /app/node_modules ./node_modules
# Copy compiled MCP server (built in builder stage)
COPY --from=builder /app/backend/mcp-src/dist /app/mcp

# Production environment variables and entrypoint
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
# Use tsx to run TypeScript directly (no prebuild needed)
CMD ["npx", "tsx", "backend/src/index.ts"] 