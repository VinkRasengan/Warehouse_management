FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY services/alert-service/package*.json ./services/alert-service/
COPY shared/ ./shared/
RUN npm ci --only=production
COPY services/alert-service/src ./services/alert-service/src
COPY services/alert-service/tsconfig.json ./services/alert-service/
WORKDIR /app/shared/types
RUN npm ci && npm run build
WORKDIR /app/shared/utils
RUN npm ci && npm run build
WORKDIR /app/services/alert-service
RUN npm ci && npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/services/alert-service/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/services/alert-service/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
RUN npm ci --only=production && npm cache clean --force
RUN mkdir -p logs && chown nodejs:nodejs logs
USER nodejs
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3006/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
