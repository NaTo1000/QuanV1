# Use Node.js LTS version with full Debian base
FROM node:20

# Set labels
LABEL maintainer="nato1000"
LABEL description="QuanV1 - Cross-platform cluster management and iPXE boot file generator"
LABEL version="0.0.1"

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Note: npm ci can have issues in some Docker environments
# Using npm install as fallback for reliability
RUN npm install --production || npm ci --only=production
RUN npm cache clean --force

# Copy application files
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
