import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// ─── Schemas ──────────────────────────────────────────────
const branchSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    schedule: z.string().optional(),
});

const templateSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['PDF', 'ZPL']),
    paperSize: z.string().default('4x6'),
    content: z.string(),
    margins: z.object({
        top: z.number(),
        left: z.number(),
        right: z.number(),
        bottom: z.number(),
    }).optional(),
    isDefault: z.boolean().default(false),
    branchId: z.string().uuid().optional(),
});

// Los números se guardan sin espacios ni guiones; el string vacío equivale a "sin dato"
const digits = (min: number, max: number, message: string) =>
    z.preprocess(
        (v) => {
            if (typeof v !== 'string') return v;
            const clean = v.replace(/[\s-]/g, '');
            return clean === '' ? undefined : clean;
        },
        z.string().regex(new RegExp(`^\\d{${min},${max}}$`), message).optional(),
    );

const bankAccountSchema = z.object({
    bankName: z.string().trim().min(2, 'Nombre del banco requerido').max(60),
    accountHolder: z.string().trim().min(2, 'Beneficiario requerido').max(80),
    clabe: digits(18, 18, 'La CLABE debe tener exactamente 18 dígitos'),
    cardNumber: digits(15, 19, 'La tarjeta debe tener entre 15 y 19 dígitos'),
    accountNumber: digits(6, 20, 'La cuenta debe tener entre 6 y 20 dígitos'),
    instructions: z.string().trim().max(300).optional(),
}).refine(
    (d) => !!(d.clabe || d.cardNumber || d.accountNumber),
    { message: 'Registra al menos CLABE, tarjeta o número de cuenta' },
);

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(['ADMIN', 'SUPERVISOR', 'OPERATOR']).default('OPERATOR'),
    branchId: z.string().uuid().optional(),
});

export async function configRoutes(app: FastifyInstance) {
    app.addHook('preHandler', (app as any).authenticate);

    // ═══════════════════════════════════════════════════════
    // BRANCHES
    // ═══════════════════════════════════════════════════════

    app.get('/branches', async () => {
        return prisma.branch.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    });

    app.post('/branches', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const body = branchSchema.parse(request.body);
        const branch = await prisma.branch.create({ data: body });
        reply.status(201).send(branch);
    });

    app.patch('/branches/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        const body = branchSchema.partial().parse(request.body);
        const branch = await prisma.branch.update({ where: { id }, data: body });
        return branch;
    });

    app.delete('/branches/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        await prisma.branch.update({ where: { id }, data: { active: false } });
        return { success: true };
    });

    // ═══════════════════════════════════════════════════════
    // DATOS BANCARIOS (configuración única)
    // ═══════════════════════════════════════════════════════

    // Datos sensibles: solo ADMIN los consulta o modifica desde el panel.
    const onlyAdmin = (request: any, reply: any) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') {
            reply.status(403).send({ error: 'Sin permisos' });
            return false;
        }
        return true;
    };

    app.get('/bank-account', async (request, reply) => {
        if (!onlyAdmin(request, reply)) return;
        const account = await prisma.bankAccount.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'asc' },
        });
        return account; // null si aún no se configura
    });

    app.put('/bank-account', async (request, reply) => {
        if (!onlyAdmin(request, reply)) return;
        const body = bankAccountSchema.parse(request.body);

        const data = {
            bankName: body.bankName,
            accountHolder: body.accountHolder,
            clabe: body.clabe ?? null,
            cardNumber: body.cardNumber ?? null,
            accountNumber: body.accountNumber ?? null,
            instructions: body.instructions?.trim() ? body.instructions.trim() : null,
            active: true,
        };

        // Se mantiene una sola configuración activa
        const existing = await prisma.bankAccount.findFirst({
            where: { active: true },
            orderBy: { createdAt: 'asc' },
        });

        const account = existing
            ? await prisma.bankAccount.update({ where: { id: existing.id }, data })
            : await prisma.bankAccount.create({ data });

        return account;
    });

    app.delete('/bank-account', async (request, reply) => {
        if (!onlyAdmin(request, reply)) return;
        await prisma.bankAccount.updateMany({ where: { active: true }, data: { active: false } });
        return { success: true };
    });

    // ═══════════════════════════════════════════════════════
    // PRINT TEMPLATES
    // ═══════════════════════════════════════════════════════

    app.get('/print-templates', async () => {
        return prisma.printTemplate.findMany({ orderBy: { name: 'asc' } });
    });

    app.post('/print-templates', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const body = templateSchema.parse(request.body);
        const template = await prisma.printTemplate.create({ data: body as any });
        reply.status(201).send(template);
    });

    app.patch('/print-templates/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        const body = templateSchema.partial().parse(request.body);
        const template = await prisma.printTemplate.update({ where: { id }, data: body as any });
        return template;
    });

    app.delete('/print-templates/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        await prisma.printTemplate.delete({ where: { id } });
        return { success: true };
    });

    // ═══════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════

    app.get('/users', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        return prisma.user.findMany({
            select: {
                id: true, email: true, name: true, role: true,
                active: true, branchId: true, branch: true, createdAt: true,
            },
            orderBy: { name: 'asc' },
        });
    });

    app.post('/users', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const body = userSchema.parse(request.body);
        const existing = await prisma.user.findUnique({ where: { email: body.email } });
        if (existing) return reply.status(400).send({ error: 'El email ya existe' });
        const passwordHash = await bcrypt.hash(body.password, 10);
        const { password, ...rest } = body;
        const newUser = await prisma.user.create({
            data: { ...rest, passwordHash },
        });
        return reply.status(201).send({
            id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role,
        });
    });

    app.patch('/users/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        const body = userSchema.partial().parse(request.body);
        const data: any = { ...body };
        if (body.password) {
            data.passwordHash = await bcrypt.hash(body.password, 10);
            delete data.password;
        }
        const updated = await prisma.user.update({ where: { id }, data });
        return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
    });

    app.delete('/users/:id', async (request, reply) => {
        const user = request.user as any;
        if (user.role !== 'ADMIN') return reply.status(403).send({ error: 'Sin permisos' });
        const { id } = request.params as any;
        if (id === user.id) return reply.status(400).send({ error: 'No puedes desactivarte a ti mismo' });
        await prisma.user.update({ where: { id }, data: { active: false } });
        return { success: true };
    });

    // ═══════════════════════════════════════════════════════
    // DASHBOARD KPIs
    // ═══════════════════════════════════════════════════════

    app.get('/dashboard', async () => {
        const [total, inTransit, outForDelivery, delivered, incidences] = await Promise.all([
            prisma.shipment.count(),
            prisma.shipment.count({ where: { currentStatus: 'IN_TRANSIT' } }),
            prisma.shipment.count({ where: { currentStatus: 'OUT_FOR_DELIVERY' } }),
            prisma.shipment.count({ where: { currentStatus: 'DELIVERED' } }),
            prisma.shipment.count({ where: { currentStatus: 'INCIDENCE' } }),
        ]);

        return {
            total,
            inTransit: inTransit + outForDelivery,
            delivered,
            incidences,
        };
    });
}
