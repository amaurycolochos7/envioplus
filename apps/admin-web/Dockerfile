# ─── Stage 1: Build ───
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=https://api.envioplus.com.mx

COPY package.json package-lock.json ./
COPY apps/admin-web/package.json apps/admin-web/
RUN npm ci --workspace=admin-web

COPY apps/admin-web/ apps/admin-web/
RUN cd apps/admin-web && VITE_API_URL=$VITE_API_URL npm run build

# ─── Stage 2: Serve ───
FROM nginx:alpine
COPY --from=builder /app/apps/admin-web/dist /usr/share/nginx/html
COPY apps/admin-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
