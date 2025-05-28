# Multi-stage build for API Gateway
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY api-gateway/package*.json ./api-gateway/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY api-gateway/src ./api-gateway/src
COPY api-gateway/tsconfig.json ./api-gateway/

# Build shared libraries
WORKDIR /app/shared/types
RUN npm ci && npm run build

WORKDIR /app/shared/utils
RUN npm ci && npm run build

# Build API Gateway
WORKDIR /app/api-gateway
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/api-gateway/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/api-gateway/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]
