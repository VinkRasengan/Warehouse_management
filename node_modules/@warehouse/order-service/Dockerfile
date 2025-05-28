FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY services/order-service/package*.json ./services/order-service/
COPY shared/ ./shared/
RUN npm ci --only=production
COPY services/order-service/src ./services/order-service/src
COPY services/order-service/tsconfig.json ./services/order-service/
WORKDIR /app/shared/types
RUN npm ci && npm run build
WORKDIR /app/shared/utils
RUN npm ci && npm run build
WORKDIR /app/services/order-service
RUN npm ci && npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/services/order-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/order-service/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
RUN npm ci --only=production && npm cache clean --force
RUN mkdir -p logs && chown nodejs:nodejs logs
USER nodejs
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
