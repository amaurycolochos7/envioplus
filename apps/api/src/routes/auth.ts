import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function authRoutes(app: FastifyInstance) {
    // ─── POST /auth/login ──────────────────────────────
    app.post('/login', async (request, reply) => {
        const body = loginSchema.parse(request.body);

        const user = await prisma.user.findUnique({
            where: { email: body.email },
            include: { branch: true },
        });

        if (!user || !user.active) {
            return reply.status(401).send({ error: 'Credenciales inválidas' });
        }

        const validPassword = await bcrypt.compare(body.password, user.passwordHash);
        if (!validPassword) {
            return reply.status(401).send({ error: 'Credenciales inválidas' });
        }

        const token = app.jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                branch: user.branch,
            },
        };
    });

    // ─── GET /auth/me ──────────────────────────────────
    app.get('/me', {
        preHandler: [(app as any).authenticate],
    }, async (request) => {
        const payload = request.user as any;
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            include: { branch: true },
        });

        if (!user || !user.active) {
            throw { statusCode: 401, message: 'Usuario no encontrado' };
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branch: user.branch,
        };
    });
}
