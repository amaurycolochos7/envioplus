import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Sucursal default ──────────────────────────────
    const branch = await prisma.branch.upsert({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Sucursal Central',
            address: 'Av. Principal #100, Centro, Ciudad de México',
            phone: '55 1234 5678',
            schedule: 'Lun-Vie 9:00-18:00, Sáb 9:00-14:00',
        },
    });
    console.log(`  ✅ Sucursal: ${branch.name}`);

    // ─── Admin user ────────────────────────────────────
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@envioplus.com.mx' },
        update: {},
        create: {
            email: 'admin@envioplus.com.mx',
            passwordHash,
            name: 'Administrador',
            role: 'ADMIN',
            branchId: branch.id,
        },
    });
    console.log(`  ✅ Admin: ${admin.email} / admin123`);

    // ─── Operador demo ─────────────────────────────────
    const opHash = await bcrypt.hash('operador123', 10);
    const operator = await prisma.user.upsert({
        where: { email: 'operador@envioplus.com.mx' },
        update: {},
        create: {
            email: 'operador@envioplus.com.mx',
            passwordHash: opHash,
            name: 'Operador Demo',
            role: 'OPERATOR',
            branchId: branch.id,
        },
    });
    console.log(`  ✅ Operador: ${operator.email} / operador123`);

    // ─── Plantilla PDF default (4x6) ──────────────────
    const pdfTemplate = await prisma.printTemplate.upsert({
        where: { id: '00000000-0000-0000-0000-000000000010' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000010',
            name: 'Etiqueta 4x6 (Default)',
            type: 'PDF',
            paperSize: '4x6',
            content: 'default',
            margins: { top: 15, left: 15, right: 15, bottom: 15 },
            isDefault: true,
        },
    });
    console.log(`  ✅ Plantilla PDF: ${pdfTemplate.name}`);

    // ─── Plantilla ZPL default ─────────────────────────
    const zplTemplate = await prisma.printTemplate.upsert({
        where: { id: '00000000-0000-0000-0000-000000000011' },
        update: {},
        create: {
            id: '00000000-0000-0000-0000-000000000011',
            name: 'ZPL 4x6 (Default)',
            type: 'ZPL',
            paperSize: '4x6',
            content: `^XA
^FO50,50^A0N,40,40^FD{{tracking}}^FS
^FO50,100^BY3^BCN,100,Y,N,N^FD{{tracking}}^FS
^FO50,220^A0N,30,30^FDDe: {{sender_name}}^FS
^FO50,260^A0N,30,30^FDPara: {{recipient_name}}^FS
^FO50,300^A0N,25,25^FD{{recipient_city}}, {{recipient_state}}^FS
^FO50,340^A0N,25,25^FDServicio: {{service_type}}^FS
^XZ`,
            isDefault: true,
        },
    });
    console.log(`  ✅ Plantilla ZPL: ${zplTemplate.name}`);

    console.log('\n🎉 Seed completado');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
