/**
 * Genera un número de tracking único con formato:
 * EP + año (2 dígitos) + mes + día + secuencia aleatoria (6 dígitos)
 * Ejemplo: EP250216-A3K9X2
 */
export function generateTrackingNumber(): string {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I,O,0,1 para evitar confusión
    let seq = '';
    for (let i = 0; i < 6; i++) {
        seq += chars[Math.floor(Math.random() * chars.length)];
    }

    return `EP${year}${month}${day}-${seq}`;
}
