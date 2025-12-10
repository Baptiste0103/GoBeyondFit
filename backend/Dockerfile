# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies (OpenSSL for Prisma, Python for bcrypt)
RUN apk add --no-cache openssl python3 make g++

# Copy package files
COPY backend/package*.json ./

# Install dependencies with lock file for reproducible builds
RUN npm ci

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code and config
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/tsconfig.build.json ./
COPY backend/nest-cli.json ./

# Build application
RUN npm run build

# Stage 2: Production  
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies (dumb-init, openssl, curl - Puppeteer deps removed, using pdfkit)
RUN apk add --no-cache \
    dumb-init \
    openssl \
    curl \
    ca-certificates

# Copy package files
COPY backend/package*.json ./

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy node_modules (includes all dependencies from builder)
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema
COPY backend/prisma ./prisma

# Copy startup script
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with migrations
CMD ["./start.sh"]
