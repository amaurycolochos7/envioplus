import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { authRoutes } from './routes/auth.js';
import { shipmentRoutes } from './routes/shipments.js';
import { eventRoutes } from './routes/events.js';
import { trackingRoutes } from './routes/tracking.js';
import { printRoutes } from './routes/print.js';
import { configRoutes } from './routes/config.js';

const app = Fastify({
    logger: true,
});

// ─── Plugins ──────────────────────────────────────────────
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : true; // dev: allow all

await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
});

await app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
});

await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

// ─── Decoradores ──────────────────────────────────────────
app.decorate('authenticate', async function (request: any, reply: any) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: 'No autorizado' });
    }
});

// ─── Manejo de errores ────────────────────────────────────
// Los errores de validación deben llegar al usuario como mensaje claro (400),
// no como "Internal Server Error".
app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof ZodError) {
        const first = error.errors[0];
        const campo = first?.path?.join('.') || '';
        return reply.status(400).send({
            error: campo ? `${campo}: ${first.message}` : first?.message || 'Datos inválidos',
        });
    }

    // Violación de unicidad en Prisma
    if (error?.code === 'P2002') {
        return reply.status(409).send({ error: 'Ya existe un registro con ese valor' });
    }

    const status = typeof error?.statusCode === 'number' && error.statusCode >= 400 ? error.statusCode : 500;
    if (status >= 500) request.log.error(error);

    return reply.status(status).send({
        error: status >= 500 ? 'Error interno del servidor' : error.message || 'Solicitud inválida',
    });
});

// ─── Health check ─────────────────────────────────────────
app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Rutas ────────────────────────────────────────────────
await app.register(authRoutes, { prefix: '/auth' });
await app.register(shipmentRoutes, { prefix: '/shipments' });
await app.register(eventRoutes, { prefix: '/shipments' });
await app.register(trackingRoutes, { prefix: '/tracking' });
await app.register(printRoutes, { prefix: '/print' });
await app.register(configRoutes, { prefix: '/config' });

// ─── Start ────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);

try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`🚀 EnvioPlus API corriendo en http://localhost:${PORT}`);
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
