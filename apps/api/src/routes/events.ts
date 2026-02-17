import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { createAuditLog } from '../utils/audit.js';

const createEventSchema = z.object({
    status: z.enum([
        'CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN', 'IN_TRANSIT',
        'AT_DESTINATION_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED',
        'INCIDENCE', 'CANCELLED',
    ]),
    notes: z.string().optional(),
    location: z.string().optional(),
    branchId: z.string().uuid().optional(),
    incidentType: z.string().optional(), // "wrong_address", "not_found", "damaged", "rejected", "other"
});

export async function eventRoutes(app: FastifyInstance) {
    app.addHook('preHandler', (app as any).authenticate);

    // ─── POST /shipments/:id/events ────────────────────
    app.post('/:id/events', async (request, reply) => {
        try {
            const user = request.user as any;
            const { id } = request.params as any;
            console.log('Received event for shipment:', id, 'Body:', request.body);
            const body = createEventSchema.parse(request.body);

            // Solo supervisores/admin pueden cancelar
            if (body.status === 'CANCELLED' && !['ADMIN', 'SUPERVISOR'].includes(user.role)) {
                return reply.status(403).send({ error: 'Sin permisos para cancelar' });
            }

            const shipment = await prisma.shipment.findUnique({ where: { id } });
            if (!shipment) return reply.status(404).send({ error: 'Guía no encontrada' });
            if (shipment.currentStatus === 'CANCELLED') {
                return reply.status(400).send({ error: 'No se pueden agregar eventos a una guía cancelada' });
            }

            const notes = body.incidentType
                ? `[${body.incidentType}] ${body.notes || ''}`
                : body.notes;

            const result = await prisma.$transaction(async (tx) => {
                const event = await tx.shipmentEvent.create({
                    data: {
                        shipmentId: id,
                        status: body.status,
                        notes,
                        location: body.location,
                        branchId: body.branchId,
                        createdById: user.id,
                    },
                });

                await tx.shipment.update({
                    where: { id },
                    data: { currentStatus: body.status },
                });

                await tx.auditLog.create({
                    data: {
                        entityType: 'shipment',
                        entityId: id,
                        action: 'status_update',
                        before: { status: shipment.currentStatus } as any,
                        after: { status: body.status } as any,
                        userId: user.id,
                    },
                });

                return event;
            });

            reply.status(201).send(result);
        } catch (error: any) {
            console.error('Error handling event:', error);
            console.error('Stack trace:', error.stack);
            if (error.code) console.error('Prisma Error Code:', error.code);
            if (error.meta) console.error('Prisma Error Meta:', error.meta);

            reply.status(500).send({
                error: 'Internal Server Error',
                message: error.message,
                details: error.meta || error.code
            });
        }
    });

    // ─── GET /shipments/:id/events ─────────────────────
    app.get('/:id/events', async (request, reply) => {
        const { id } = request.params as any;
        const events = await prisma.shipmentEvent.findMany({
            where: { shipmentId: id },
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: { select: { id: true, name: true } },
                branch: { select: { id: true, name: true } },
            },
        });
        return events;
    });
}
