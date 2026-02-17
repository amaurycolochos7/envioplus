import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import { generateShipmentPdf, getAvailableSizes } from '../services/pdf.js';

export async function printRoutes(app: FastifyInstance) {
    // ─── GET /print/sizes ──────────────────────────────
    // Retorna los tamaños de papel disponibles
    app.get('/sizes', async () => {
        return getAvailableSizes();
    });

    // Genera un token de corta duración para imprimir
    app.get('/:id/token', { preHandler: (app as any).authenticate }, async (request, reply) => {
        const { id } = request.params as any;
        const user = request.user as any;

        // Verificar acceso a la guía (opcional: validar branch)
        const shipment = await prisma.shipment.findUnique({ where: { id } });
        if (!shipment) return reply.status(404).send({ error: 'Guía no encontrada' });

        // Generar token firmado con scope 'print' y expiración 5m
        const token = app.jwt.sign({
            id: user.id,
            shipmentId: id,
            scope: 'print'
        }, { expiresIn: '5m' });

        return { token };
    });

    // ─── GET /print/:id/pdf ────────────────────────────
    app.get('/:id/pdf', async (request, reply) => {
        const { id } = request.params as any;
        const query = request.query as any;
        const token = query.pt;

        // Validar token de impresión
        if (!token) return reply.status(401).send({ error: 'Token de impresión requerido (?pt=)' });

        try {
            const decoded: any = app.jwt.verify(token);
            if (decoded.scope !== 'print' || decoded.shipmentId !== id) {
                throw new Error('Token inválido para esta guía');
            }
            // Inyectar usuario para audit log
            request.user = { id: decoded.id };
        } catch (err) {
            return reply.status(401).send({ error: 'Token de impresión inválido o expirado' });
        }

        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { originBranch: true, destinationBranch: true },
        });

        if (!shipment) return reply.status(404).send({ error: 'Guía no encontrada' });

        // Buscar plantilla
        let template = null;
        if (query.template) {
            template = await prisma.printTemplate.findUnique({ where: { id: query.template } });
        }
        if (!template) {
            template = await prisma.printTemplate.findFirst({
                where: { type: 'PDF', isDefault: true },
            });
        }

        const pdfBuffer = await generateShipmentPdf(shipment, template, query.size || undefined);

        // Log de reimpresión en auditoría
        const user = request.user as any;
        await prisma.auditLog.create({
            data: {
                entityType: 'shipment',
                entityId: id,
                action: 'print',
                after: { templateId: template?.id, format: 'PDF' } as any,
                userId: user.id,
            },
        });

        reply.type('application/pdf');
        reply.header('Content-Disposition', `inline; filename="guia-${shipment.trackingNumber}.pdf"`);
        return reply.send(Buffer.from(pdfBuffer));
    });

    // ─── GET /print/:id/zpl ────────────────────────────
    app.get('/:id/zpl', async (request, reply) => {
        const { id } = request.params as any;
        const query = request.query as any;
        const token = query.pt;

        // Validar token de impresión
        if (!token) return reply.status(401).send({ error: 'Token de impresión requerido (?pt=)' });

        try {
            const decoded: any = app.jwt.verify(token);
            if (decoded.scope !== 'print' || decoded.shipmentId !== id) {
                throw new Error('Token inválido para esta guía');
            }
            request.user = { id: decoded.id };
        } catch (err) {
            return reply.status(401).send({ error: 'Token de impresión inválido o expirado' });
        }

        const shipment = await prisma.shipment.findUnique({
            where: { id },
            include: { originBranch: true },
        });

        if (!shipment) return reply.status(404).send({ error: 'Guía no encontrada' });

        let template = await prisma.printTemplate.findFirst({
            where: { type: 'ZPL', isDefault: true },
        });

        const addr = shipment.recipientAddress as any;
        const zpl = template?.content
            ? template.content
                .replace('{{tracking}}', shipment.trackingNumber)
                .replace('{{recipient_name}}', shipment.recipientName)
                .replace('{{recipient_city}}', addr?.city || '')
                .replace('{{recipient_state}}', addr?.state || '')
                .replace('{{sender_name}}', shipment.senderName)
                .replace('{{service_type}}', shipment.serviceType)
            : `^XA
^FO50,50^A0N,40,40^FD${shipment.trackingNumber}^FS
^FO50,100^BY3^BCN,100,Y,N,N^FD${shipment.trackingNumber}^FS
^FO50,220^A0N,30,30^FDDe: ${shipment.senderName}^FS
^FO50,260^A0N,30,30^FDPara: ${shipment.recipientName}^FS
^FO50,300^A0N,25,25^FD${addr?.city || ''}, ${addr?.state || ''}^FS
^FO50,340^A0N,25,25^FDServicio: ${shipment.serviceType}^FS
^XZ`;

        const user = request.user as any;
        await prisma.auditLog.create({
            data: {
                entityType: 'shipment',
                entityId: id,
                action: 'print',
                after: { templateId: template?.id, format: 'ZPL' } as any,
                userId: user.id,
            },
        });

        reply.type('text/plain');
        return reply.send(zpl);
    });
}
