import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

export async function trackingRoutes(app: FastifyInstance) {
    // Rate limit más estricto para tracking público
    app.register(import('@fastify/rate-limit'), {
        max: 30,
        timeWindow: '1 minute',
    });

    // ─── GET /tracking/:trackingNumber ──────────────────
    app.get('/:trackingNumber', async (request, reply) => {
        const { trackingNumber } = request.params as any;

        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            select: {
                trackingNumber: true,
                currentStatus: true,
                packageType: true,
                serviceType: true,
                createdAt: true,
                // Solo ciudad/estado (no dirección completa por seguridad)
                senderAddress: true,
                recipientAddress: true,
                events: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        status: true,
                        notes: true,
                        location: true,
                        createdAt: true,
                        branch: { select: { name: true } },
                    },
                },
            },
        });

        if (!shipment) {
            return reply.status(404).send({ error: 'No se encontró el envío' });
        }

        // Filtrar datos sensibles de las direcciones — solo ciudad/estado
        const sanitize = (addr: any) => {
            if (!addr) return null;
            return { city: addr.city, state: addr.state };
        };

        return {
            trackingNumber: shipment.trackingNumber,
            status: shipment.currentStatus,
            packageType: shipment.packageType,
            serviceType: shipment.serviceType,
            createdAt: shipment.createdAt,
            origin: sanitize(shipment.senderAddress),
            destination: sanitize(shipment.recipientAddress),
            events: shipment.events,
        };
    });
}
