# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source and config files
COPY frontend/app ./app
COPY frontend/lib ./lib
COPY frontend/hooks ./hooks
COPY frontend/providers ./providers
COPY frontend/components ./components
COPY frontend/public ./public
COPY frontend/.env.local ./
COPY frontend/next.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/postcss.config.mjs ./
COPY frontend/components.json ./

# Build application with optimizations and memory allocation
# Force webpack instead of Turbopack to avoid memory issues
RUN NEXT_SKIP_ENV_VALIDATION=1 TURBOPACK_DISABLED=true NODE_OPTIONS="--max-old-space-size=1024" npm run build && npm cache clean --force

# Stage 2: Production (Standalone)
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy configuration files (needed for path alias resolution)
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Copy runtime source directories (needed for Next.js route handlers and dynamic imports)
COPY --from=builder /app/app ./app
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/components ./components
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/providers ./providers

# Copy custom server.js
COPY frontend/server.js ./server.js

# Copy start script
COPY frontend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application on port 3001
CMD ["./start.sh"]
