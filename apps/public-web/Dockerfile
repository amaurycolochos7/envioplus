# ─── Stage 1: Build ───
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=https://api.envioplus.com.mx

COPY package.json package-lock.json ./
COPY apps/public-web/package.json apps/public-web/
RUN npm ci --workspace=apps/public-web

COPY apps/public-web/ apps/public-web/
RUN cd apps/public-web && VITE_API_URL=$VITE_API_URL npm run build

# ─── Stage 2: Serve ───
FROM nginx:alpine
COPY --from=builder /app/apps/public-web/dist /usr/share/nginx/html
COPY apps/public-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
