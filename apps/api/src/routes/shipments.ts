import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { z } from 'zod';
import { generateTrackingNumber } from '../utils/tracking.js';
import { createAuditLog } from '../utils/audit.js';

const addressSchema = z.object({
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    references: z.string().optional(),
});

const createShipmentSchema = z.object({
    senderName: z.string().min(1),
    senderPhone: z.string().min(8),
    senderEmail: z.string().email().optional(),
    senderAddress: addressSchema,
    recipientName: z.string().min(1),
    recipientPhone: z.string().min(8),
    recipientEmail: z.string().email().optional(),
    recipientAddress: addressSchema,
    packageType: z.enum(['ENVELOPE', 'BOX', 'PACKAGE', 'OTHER']).default('PACKAGE'),
    weight: z.number().positive().optional(),
    dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
    }).optional(),
    declaredContent: z.string().optional(),
    declaredValue: z.number().min(0).optional(),
    serviceType: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
    insurance: z.boolean().default(false),
    insuranceAmount: z.number().min(0).optional(),
    pickupRequested: z.boolean().default(false),
    paymentMethod: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']).default('CASH'),
    subtotal: z.number().min(0).default(0),
    extras: z.number().min(0).default(0),
    totalAmount: z.number().min(0).default(0),
    paid: z.boolean().default(false),
    originBranchId: z.string().uuid().optional(),
    destinationBranchId: z.string().uuid().optional(),
});

const SHIPMENT_STATUSES = [
    'CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN', 'IN_TRANSIT',
    'AT_DESTINATION_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED',
    'INCIDENCE', 'CANCELLED',
] as const;

// Edición completa de la guía. Todo es opcional: solo se aplica lo que llega.
// No se exponen identificadores internos ni fechas de auditoría.
const updateShipmentSchema = z.object({
    trackingNumber: z.string().trim().min(6).max(30).regex(/^[A-Za-z0-9-]+$/, 'Formato de guía inválido').optional(),
    senderName: z.string().min(1).optional(),
    senderPhone: z.string().min(8).optional(),
    senderEmail: z.string().email().nullish(),
    senderAddress: addressSchema.optional(),
    recipientName: z.string().min(1).optional(),
    recipientPhone: z.string().min(8).optional(),
    recipientEmail: z.string().email().nullish(),
    recipientAddress: addressSchema.optional(),
    packageType: z.enum(['ENVELOPE', 'BOX', 'PACKAGE', 'OTHER']).optional(),
    weight: z.number().positive().nullish(),
    dimensions: z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
    }).nullish(),
    declaredContent: z.string().nullish(),
    declaredValue: z.number().min(0).nullish(),
    serviceType: z.enum(['STANDARD', 'EXPRESS']).optional(),
    insurance: z.boolean().optional(),
    insuranceAmount: z.number().min(0).nullish(),
    pickupRequested: z.boolean().optional(),
    paymentMethod: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']).optional(),
    subtotal: z.number().min(0).optional(),
    extras: z.number().min(0).optional(),
    totalAmount: z.number().min(0).optional(),
    paid: z.boolean().optional(),
    currentStatus: z.enum(SHIPMENT_STATUSES).optional(),
    originBranchId: z.string().uuid().nullish(),
    destinationBranchId: z.string().uuid().nullish(),
});

export async function shipmentRoutes(app: FastifyInstance) {
    // Todas las rutas requieren autenticación
    app.addHook('preHandler', (app as any).authenticate);

    // ─── POST /shipments (crear guía) ──────────────────
    app.post('/', async (request, reply) => {
        const user = request.user as any;
        const body = createShipmentSchema.parse(request.body);
        const trackingNumber = generateTrackingNumber();

        const shipment = await prisma.$transaction(async (tx) => {
            const created = await tx.shipment.create({
                data: {
                    trackingNumber,
                    ...body,
                    senderAddress: body.senderAddress as any,
                    recipientAddress: body.recipientAddress as any,
                    dimensions: body.dimensions as any,
                    paidAt: body.paid ? new Date() : null,
                    createdByUserId: user.id,
                },
            });

            // Crear evento inicial
            await tx.shipmentEvent.create({
                data: {
                    shipmentId: created.id,
                    status: 'CREATED',
                    notes: 'Guía creada',
                    branchId: body.originBranchId,
                    createdById: user.id,
                },
            });

            // Auditoría
            await tx.auditLog.create({
                data: {
                    entityType: 'shipment',
                    entityId: created.id,
                    action: 'create',
                    after: created as any,
                    userId: user.id,
                },
            });

            return created;
        });

        reply.status(201).send(shipment);
    });

    // ─── GET /shipments (lista con filtros) ────────────
    app.get('/', async (request) => {
        const query = request.query as any;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.status) where.currentStatus = query.status;
        if (query.branchId) where.originBranchId = query.branchId;
        if (query.search) {
            where.OR = [
                { trackingNumber: { contains: query.search, mode: 'insensitive' } },
                { recipientName: { contains: query.search, mode: 'insensitive' } },
                { recipientPhone: { contains: query.search } },
                { senderName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }

        const [shipments, total] = await Promise.all([
            prisma.shipment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    originBranch: true,
                    destinationBranch: true,
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma.shipment.count({ where }),
        ]);

        return {
            data: shipments,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    });

    // ─── GET /shipments/:id ────────────────────────────
    app.get('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: {
                originBranch: true,
                destinationBranch: true,
                createdBy: { select: { id: true, name: true } },
                events: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { id: true, name: true } },
                        branch: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!shipment) {
            return reply.status(404).send({ error: 'Guía no encontrada' });
        }

        return shipment;
    });

    // ─── PATCH /shipments/:id (edición completa) ──────
    app.patch('/:id', async (request, reply) => {
        const user = request.user as any;

        // Solo ADMIN y SUPERVISOR pueden editar guías
        if (!['ADMIN', 'SUPERVISOR'].includes(user.role)) {
            return reply.status(403).send({ error: 'Sin permisos para editar guías' });
        }

        const { id } = request.params as any;
        const body = updateShipmentSchema.parse(request.body);

        const existing = await prisma.shipment.findUnique({ where: { id } });
        if (!existing) return reply.status(404).send({ error: 'Guía no encontrada' });
        if (existing.currentStatus === 'CANCELLED' && body.currentStatus !== 'CANCELLED') {
            return reply.status(400).send({ error: 'No se puede editar una guía cancelada' });
        }

        const data: any = { ...body };

        // Número de guía: se normaliza y se valida que no exista otro igual
        if (body.trackingNumber) {
            const tracking = body.trackingNumber.toUpperCase();
            if (tracking !== existing.trackingNumber) {
                const duplicated = await prisma.shipment.findUnique({ where: { trackingNumber: tracking } });
                if (duplicated) {
                    return reply.status(409).send({ error: 'Ya existe otra guía con ese número' });
                }
            }
            data.trackingNumber = tracking;
        }

        // El estado de pago arrastra su fecha
        if (body.paid !== undefined && body.paid !== existing.paid) {
            data.paidAt = body.paid ? new Date() : null;
        }

        const statusChanged = !!body.currentStatus && body.currentStatus !== existing.currentStatus;

        const updated = await prisma.$transaction(async (tx) => {
            const result = await tx.shipment.update({ where: { id }, data });

            // El cambio de estado se registra en el historial como cualquier otro evento
            if (statusChanged) {
                await tx.shipmentEvent.create({
                    data: {
                        shipmentId: id,
                        status: body.currentStatus!,
                        notes: 'Estado actualizado desde la edición de la guía',
                        createdById: user.id,
                    },
                });
            }

            return result;
        });

        await createAuditLog(user.id, 'shipment', id, 'update', existing, updated);

        return updated;
    });

    // ─── PATCH /shipments/:id/payment (pagado / no pagado) ──
    app.patch('/:id/payment', async (request, reply) => {
        const user = request.user as any;
        const { id } = request.params as any;
        const { paid } = z.object({ paid: z.boolean() }).parse(request.body);

        const existing = await prisma.shipment.findUnique({ where: { id } });
        if (!existing) return reply.status(404).send({ error: 'Guía no encontrada' });

        const updated = await prisma.shipment.update({
            where: { id },
            data: { paid, paidAt: paid ? new Date() : null },
        });

        await createAuditLog(user.id, 'shipment', id, paid ? 'mark_paid' : 'mark_unpaid', existing, updated);

        return updated;
    });

    // ─── POST /shipments/:id/cancel ────────────────────
    app.post('/:id/cancel', async (request, reply) => {
        const user = request.user as any;

        // Solo ADMIN y SUPERVISOR pueden cancelar
        if (!['ADMIN', 'SUPERVISOR'].includes(user.role)) {
            return reply.status(403).send({ error: 'Sin permisos para cancelar' });
        }

        const { id } = request.params as any;
        const { reason } = request.body as any;
        if (!reason) return reply.status(400).send({ error: 'Se requiere motivo de cancelación' });

        const existing = await prisma.shipment.findUnique({ where: { id } });
        if (!existing) return reply.status(404).send({ error: 'Guía no encontrada' });
        if (existing.currentStatus === 'CANCELLED') {
            return reply.status(400).send({ error: 'La guía ya está cancelada' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.shipment.update({
                where: { id },
                data: { currentStatus: 'CANCELLED' },
            });

            await tx.shipmentEvent.create({
                data: {
                    shipmentId: id,
                    status: 'CANCELLED',
                    notes: `Cancelada: ${reason}`,
                    createdById: user.id,
                },
            });

            await tx.auditLog.create({
                data: {
                    entityType: 'shipment',
                    entityId: id,
                    action: 'cancel',
                    before: existing as any,
                    after: updated as any,
                    userId: user.id,
                },
            });

            return updated;
        });

        return result;
    });
}
