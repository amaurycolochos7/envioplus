import Fastify from 'fastify';
import cors from '@fastify/cors';
import fjwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
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
