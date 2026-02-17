import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces.js';

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};

const printer = new PdfPrinter(fonts);

// ─── Tamaños de página predefinidos (en puntos, 72pt = 1in) ───
const PAGE_SIZES: Record<string, { width: number; height: number; label: string }> = {
    'HALF_LETTER': { width: 396, height: 612, label: 'Media carta (5.5 × 8.5 in)' },
    'LETTER': { width: 612, height: 792, label: 'Carta (8.5 × 11 in)' },
    'A4': { width: 595, height: 842, label: 'A4 (210 × 297 mm)' },
    'A5': { width: 420, height: 595, label: 'A5 (148 × 210 mm)' },
    '4X6': { width: 288, height: 432, label: 'Etiqueta 4 × 6 in' },
    '10X15': { width: 283, height: 425, label: 'Etiqueta 10 × 15 cm' },
};

/** Retorna los tamaños disponibles para el frontend */
export function getAvailableSizes() {
    return Object.entries(PAGE_SIZES).map(([key, v]) => ({ key, label: v.label }));
}

export async function generateShipmentPdf(
    shipment: any,
    template: any,
    sizeKey?: string,
): Promise<Buffer> {
    const sAddr = shipment.senderAddress as any;
    const rAddr = shipment.recipientAddress as any;

    // ─── Determinar tamaño de página ─────────────────────
    let pageSize: { width: number; height: number };
    if (sizeKey && PAGE_SIZES[sizeKey]) {
        pageSize = PAGE_SIZES[sizeKey];
    } else if (template?.paperSize && PAGE_SIZES[template.paperSize]) {
        pageSize = PAGE_SIZES[template.paperSize];
    } else {
        pageSize = PAGE_SIZES['HALF_LETTER']; // Default: media carta — cabe todo en 1 pág
    }

    // ─── Márgenes adaptativos según tamaño ───────────────
    const isSmall = pageSize.width < 350; // etiqueta pequeña
    const margin = isSmall ? 8 : 20;
    const margins: [number, number, number, number] = template?.margins
        ? [template.margins.left, template.margins.top, template.margins.right, template.margins.bottom]
        : [margin, margin, margin, margin];
    const contentWidth = pageSize.width - margins[0] - margins[2];

    // ─── Fuentes adaptativas ─────────────────────────────
    const titleSize = isSmall ? 12 : 16;
    const trackSize = isSmall ? 16 : 24;
    const headSize = isSmall ? 7 : 9;
    const nameSize = isSmall ? 8 : 11;
    const bodySize = isSmall ? 7 : 8;
    const smallSize = isSmall ? 6 : 7;
    const defaultSize = isSmall ? 7 : 9;

    const docDefinition: TDocumentDefinitions = {
        defaultStyle: { font: 'Helvetica', fontSize: defaultSize },
        pageSize: { width: pageSize.width, height: pageSize.height },
        pageMargins: margins,
        content: [
            // ═══ ENCABEZADO ═══
            {
                columns: [
                    { text: 'ENVIOPLUS', fontSize: titleSize, bold: true, color: '#0B2E59' },
                    {
                        text: shipment.serviceType === 'EXPRESS' ? 'EXPRÉS' : 'ESTÁNDAR',
                        fontSize: isSmall ? 9 : 12,
                        bold: true,
                        alignment: 'right' as const,
                        color: shipment.serviceType === 'EXPRESS' ? '#B45309' : '#047857',
                    },
                ],
            },
            {
                canvas: [{
                    type: 'line' as const,
                    x1: 0, y1: 4,
                    x2: contentWidth, y2: 4,
                    lineWidth: 1.5, lineColor: '#0B2E59',
                }],
            },

            // ═══ TRACKING ═══
            {
                text: shipment.trackingNumber,
                fontSize: trackSize,
                bold: true,
                alignment: 'center' as const,
                margin: [0, isSmall ? 6 : 10, 0, isSmall ? 4 : 8] as [number, number, number, number],
                color: '#0B2E59',
            },

            // ═══ REMITENTE ═══
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                { text: 'REMITENTE', fontSize: headSize, bold: true, color: '#666', margin: [0, 0, 0, 2] as [number, number, number, number] },
                                { text: shipment.senderName, bold: true, fontSize: bodySize },
                                { text: `${sAddr?.street || ''} ${sAddr?.number || ''}, ${sAddr?.neighborhood || ''}`, fontSize: bodySize, color: '#333' },
                                { text: `${sAddr?.city || ''}, ${sAddr?.state || ''} C.P. ${sAddr?.zip || ''}`, fontSize: bodySize, color: '#333' },
                                { text: `Tel: ${shipment.senderPhone || '—'}`, fontSize: smallSize, color: '#555' },
                            ],
                            margin: [4, 4, 4, 4] as [number, number, number, number],
                        },
                    ]],
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#ccc',
                    vLineColor: () => '#ccc',
                },
                margin: [0, 0, 0, isSmall ? 4 : 8] as [number, number, number, number],
            },

            // ═══ DESTINATARIO ═══
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            stack: [
                                { text: 'DESTINATARIO', fontSize: headSize, bold: true, color: '#047857', margin: [0, 0, 0, 2] as [number, number, number, number] },
                                { text: shipment.recipientName, bold: true, fontSize: nameSize },
                                { text: `${rAddr?.street || ''} ${rAddr?.number || ''}, ${rAddr?.neighborhood || ''}`, fontSize: bodySize, color: '#333' },
                                { text: `${rAddr?.city || ''}, ${rAddr?.state || ''} C.P. ${rAddr?.zip || ''}`, fontSize: bodySize, color: '#333' },
                                { text: `Tel: ${shipment.recipientPhone || '—'}`, fontSize: smallSize, color: '#555' },
                                ...(rAddr?.references
                                    ? [{ text: `Ref: ${rAddr.references}`, fontSize: smallSize, italics: true, color: '#777' }]
                                    : []),
                            ],
                            margin: [4, 4, 4, 4] as [number, number, number, number],
                        },
                    ]],
                },
                layout: {
                    hLineWidth: () => 1,
                    vLineWidth: () => 1,
                    hLineColor: () => '#047857',
                    vLineColor: () => '#047857',
                },
                margin: [0, 0, 0, isSmall ? 4 : 8] as [number, number, number, number],
            },

            // ═══ DETALLES DEL PAQUETE ═══
            {
                canvas: [{
                    type: 'line' as const,
                    x1: 0, y1: 2,
                    x2: contentWidth, y2: 2,
                    lineWidth: 0.5, dash: { length: 3 },
                    lineColor: '#999',
                }],
            },
            {
                columns: [
                    { text: `Tipo: ${shipment.packageType || '—'}`, fontSize: smallSize },
                    { text: shipment.weight ? `Peso: ${shipment.weight} kg` : '', fontSize: smallSize },
                    { text: shipment.declaredValue ? `Valor: $${shipment.declaredValue}` : '', fontSize: smallSize, alignment: 'right' as const },
                ],
                margin: [0, 4, 0, 2] as [number, number, number, number],
            },
            ...(shipment.declaredContent
                ? [{ text: `Contenido: ${shipment.declaredContent}`, fontSize: smallSize, color: '#555' }]
                : []),

            // ═══ SUCURSALES ═══
            ...(shipment.originBranch || shipment.destinationBranch ? [
                {
                    canvas: [{
                        type: 'line' as const,
                        x1: 0, y1: 6,
                        x2: contentWidth, y2: 6,
                        lineWidth: 0.5, dash: { length: 3 },
                        lineColor: '#999',
                    }],
                },
                {
                    columns: [
                        {
                            stack: [
                                { text: 'ORIGEN', fontSize: smallSize - 1, bold: true, color: '#888' },
                                { text: shipment.originBranch?.name || '—', fontSize: smallSize },
                            ],
                        },
                        {
                            stack: [
                                { text: 'DESTINO', fontSize: smallSize - 1, bold: true, color: '#888' },
                                { text: shipment.destinationBranch?.name || '—', fontSize: smallSize },
                            ],
                            alignment: 'right' as const,
                        },
                    ],
                    margin: [0, 4, 0, 0] as [number, number, number, number],
                },
            ] : []),
        ],
    };

    return new Promise((resolve, reject) => {
        const doc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.end();
    });
}
