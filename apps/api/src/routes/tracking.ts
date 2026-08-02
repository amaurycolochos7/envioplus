import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';

const STATUS_ORDER = [
    'CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN', 'IN_TRANSIT',
    'AT_DESTINATION_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED'
];

export async function trackingRoutes(app: FastifyInstance) {
    app.register(import('@fastify/rate-limit'), {
        max: 30,
        timeWindow: '1 minute',
    });

    // ─── GET /tracking/:trackingNumber ──────────────────
    app.get('/:trackingNumber', async (request, reply) => {
        const { trackingNumber } = request.params as any;

        // El cliente siempre debe ver el dato vigente de la guía
        reply.header('Cache-Control', 'no-store, must-revalidate');

        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            select: {
                trackingNumber: true,
                currentStatus: true,
                packageType: true,
                serviceType: true,
                weight: true,
                dimensions: true,
                declaredContent: true,
                declaredValue: true,
                insurance: true,
                insuranceAmount: true,
                totalAmount: true,
                paymentMethod: true,
                paid: true,
                paidAt: true,
                senderName: true,
                senderPhone: true,
                senderAddress: true,
                recipientName: true,
                recipientPhone: true,
                recipientAddress: true,
                createdAt: true,
                originBranch: { select: { name: true } },
                destinationBranch: { select: { name: true } },
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

        // ¿Hay datos bancarios configurados? Solo se informa la disponibilidad,
        // los datos se entregan en el endpoint dedicado.
        const bankConfigured = await prisma.bankAccount.count({ where: { active: true } });

        // Calculate progress percentage based on status order
        const statusIdx = STATUS_ORDER.indexOf(shipment.currentStatus);
        const progressPercent = statusIdx >= 0
            ? Math.round(((statusIdx + 1) / STATUS_ORDER.length) * 100)
            : (shipment.currentStatus === 'CANCELLED' || shipment.currentStatus === 'INCIDENCE' ? 0 : 10);

        // Origin: only city/state for privacy
        const origin = shipment.senderAddress
            ? { city: (shipment.senderAddress as any).city, state: (shipment.senderAddress as any).state }
            : null;

        // Destination: full address (shown in reference images)
        const dest = shipment.recipientAddress as any;
        const destination = dest ? {
            street: dest.street,
            number: dest.number,
            neighborhood: dest.neighborhood,
            city: dest.city,
            state: dest.state,
            zip: dest.zip,
        } : null;

        return {
            trackingNumber: shipment.trackingNumber,
            status: shipment.currentStatus,
            packageType: shipment.packageType,
            serviceType: shipment.serviceType,
            weight: shipment.weight,
            dimensions: shipment.dimensions,
            declaredContent: shipment.declaredContent,
            declaredValue: shipment.declaredValue,
            insurance: shipment.insurance,
            insuranceAmount: shipment.insuranceAmount,
            totalAmount: shipment.totalAmount,
            paymentMethod: shipment.paymentMethod,
            paid: shipment.paid,
            paidAt: shipment.paidAt,
            paymentInfoAvailable: bankConfigured > 0,
            recipientName: shipment.recipientName,
            recipientPhone: shipment.recipientPhone,
            senderName: shipment.senderName,
            createdAt: shipment.createdAt,
            progressPercent,
            origin,
            destination,
            originBranch: shipment.originBranch?.name || null,
            destinationBranch: shipment.destinationBranch?.name || null,
            events: shipment.events,
        };
    });

    // ─── GET /tracking/:trackingNumber/payment-info ─────
    // Datos para transferir. Solo se entregan si la guía existe y sigue pendiente.
    app.get('/:trackingNumber/payment-info', async (request, reply) => {
        const { trackingNumber } = request.params as any;
        reply.header('Cache-Control', 'no-store, must-revalidate');

        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            select: { trackingNumber: true, totalAmount: true, paid: true },
        });

        if (!shipment) {
            return reply.status(404).send({ error: 'No se encontró el envío' });
        }

        if (shipment.paid) {
            return { paid: true, bankAccount: null };
        }

        const account = await prisma.bankAccount.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'asc' },
            select: {
                bankName: true,
                accountHolder: true,
                clabe: true,
                cardNumber: true,
                accountNumber: true,
                instructions: true,
            },
        });

        if (!account) {
            return reply.status(404).send({ error: 'Aún no hay datos bancarios configurados' });
        }

        return {
            paid: false,
            amount: shipment.totalAmount,
            reference: shipment.trackingNumber,
            bankAccount: account,
        };
    });
}
