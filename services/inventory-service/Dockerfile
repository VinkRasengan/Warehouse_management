# Multi-stage build for Inventory Service
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/inventory-service/package*.json ./services/inventory-service/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/inventory-service/src ./services/inventory-service/src
COPY services/inventory-service/tsconfig.json ./services/inventory-service/

# Build shared libraries
WORKDIR /app/shared/types
RUN npm ci && npm run build

WORKDIR /app/shared/utils
RUN npm ci && npm run build

# Build Inventory Service
WORKDIR /app/services/inventory-service
RUN npm ci && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/services/inventory-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/inventory-service/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/index.js"]
