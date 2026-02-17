# ─── Stage 1: Build ───
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
RUN npm ci --workspace=apps/api

COPY apps/api/ apps/api/
RUN cd apps/api && npx prisma generate && npm run build

# ─── Stage 2: Run ───
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/dist/ ./dist/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/apps/api/prisma/ ./prisma/

# Prisma client
COPY --from=builder /app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma/ ./node_modules/@prisma/

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
