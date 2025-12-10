# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment variable for API URL (baked into client bundle)
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:3000/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

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
COPY frontend/tailwind.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/postcss.config.mjs ./
COPY frontend/components.json ./

# Create .env.production to ensure NEXT_PUBLIC vars are baked in
RUN echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" > .env.production

# Build application with optimizations and memory allocation
# Force webpack instead of Turbopack to avoid memory issues
RUN NEXT_SKIP_ENV_VALIDATION=1 TURBOPACK_DISABLED=true NODE_OPTIONS="--max-old-space-size=1024" npm run build && npm cache clean --force

# Stage 2: Production (Standalone)
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
# Copy static files to the standalone folder (required for Next.js standalone)
COPY --from=builder /app/.next/static ./.next/static
# Copy public files
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the standalone server directly
CMD ["node", "server.js"]
