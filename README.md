# EnvioPlus — Sistema de Paquetería

## Estructura

```
envioplus/
├── apps/
│   ├── api/            # Backend (Fastify + Prisma + PostgreSQL)
│   ├── admin-web/      # Panel admin (Vite + React)
│   └── public-web/     # Landing + Tracking público (Vite + React)
└── docs/               # Documentación
```

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Generar Prisma client
npm run prisma:generate

# Migraciones
npm run prisma:migrate

# Seed
npm run prisma:seed

# Levantar backend
npm run dev:api

# Levantar admin
npm run dev:admin

# Levantar público
npm run dev:public
```

## Dominio

- `envioplus.com.mx` — Landing + Tracking
- `app.envioplus.com.mx` — Panel Admin
- `api.envioplus.com.mx` — API
