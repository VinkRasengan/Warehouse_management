FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY services/customer-service/package*.json ./services/customer-service/
COPY shared/ ./shared/
RUN npm ci --only=production
COPY services/customer-service/src ./services/customer-service/src
COPY services/customer-service/tsconfig.json ./services/customer-service/
WORKDIR /app/shared/types
RUN npm ci && npm run build
WORKDIR /app/shared/utils
RUN npm ci && npm run build
WORKDIR /app/services/customer-service
RUN npm ci && npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/services/customer-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/customer-service/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
RUN npm ci --only=production && npm cache clean --force
RUN mkdir -p logs && chown nodejs:nodejs logs
USER nodejs
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
