// Datos fijos de la empresa. Se usan para precargar el remitente al crear una guia,
// asi el operador solo captura los datos del destinatario.
export const COMPANY = {
    name: 'EnvioPlus',
    phone: '5565872156',
    email: 'contacto@envioplus.com.mx',
    street: 'Av. Principal',
    number: '123',
    neighborhood: 'Centro',
    city: 'Ciudad de Mexico',
    state: 'Ciudad de Mexico',
    zip: '06000',
    references: '',
};

export const DEFAULT_SENDER = {
    senderName: COMPANY.name,
    senderPhone: COMPANY.phone,
    senderEmail: COMPANY.email,
    senderStreet: COMPANY.street,
    senderNumber: COMPANY.number,
    senderNeighborhood: COMPANY.neighborhood,
    senderCity: COMPANY.city,
    senderState: COMPANY.state,
    senderZip: COMPANY.zip,
    senderReferences: COMPANY.references,
};

export type SenderData = typeof DEFAULT_SENDER;

const STORAGE_KEY = 'envioplus:default-sender';

// Ultimo remitente usado (si el operador lo edito), con fallback a los datos de la empresa.
export function loadSender(): SenderData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_SENDER, ...JSON.parse(raw) };
    } catch { /* datos corruptos: usar defaults */ }
    return { ...DEFAULT_SENDER };
}

export function saveSender(sender: SenderData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sender));
    } catch { /* storage no disponible */ }
}

export function clearSender() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}
