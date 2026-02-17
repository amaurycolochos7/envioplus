import prisma from '../lib/prisma.js';

export async function createAuditLog(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    before?: any,
    after?: any
) {
    return prisma.auditLog.create({
        data: {
            entityType,
            entityId,
            action,
            before: before ? JSON.parse(JSON.stringify(before)) : undefined,
            after: after ? JSON.parse(JSON.stringify(after)) : undefined,
            userId,
        },
    });
}
