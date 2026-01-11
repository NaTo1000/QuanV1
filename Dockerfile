# Multi-stage build for QuanV1 Clustered System
# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Using npm ci for reproducible builds in CI/CD environments
RUN npm ci --omit=dev

# Production image  
FROM node:20-slim

# Set labels
LABEL maintainer="nato1000"
LABEL description="QuanV1 - Cross-platform cluster management and iPXE boot file generator"
LABEL version="0.0.1"

# Set working directory
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY package.json ./
COPY index.js ./
COPY haikus.json ./
COPY process.json ./
COPY web.config ./
COPY public ./public
COPY views ./views

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "index.js"]
