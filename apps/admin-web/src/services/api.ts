const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
    return localStorage.getItem('ep_token');
}

export function setToken(token: string) {
    localStorage.setItem('ep_token', token);
}

export function clearToken() {
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
}

export function getStoredUser() {
    const raw = localStorage.getItem('ep_user');
    return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any) {
    localStorage.setItem('ep_user', JSON.stringify(user));
}

async function request(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        clearToken();
        window.location.href = '/login';
        throw new Error('No autorizado');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
        throw new Error(err.error || `Error ${res.status}`);
    }

    return res.json();
}

export const api = {
    // Auth
    login: (email: string, password: string) =>
        request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request('/auth/me'),

    // Dashboard
    dashboard: () => request('/config/dashboard'),

    // Shipments
    createShipment: (data: any) =>
        request('/shipments', { method: 'POST', body: JSON.stringify(data) }),
    getShipments: (params: string) =>
        request(`/shipments?${params}`),
    getShipment: (id: string) =>
        request(`/shipments/${id}`),
    updateShipment: (id: string, data: any) =>
        request(`/shipments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancelShipment: (id: string, reason: string) =>
        request(`/shipments/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),

    // Events
    addEvent: (shipmentId: string, data: any) =>
        request(`/shipments/${shipmentId}/events`, { method: 'POST', body: JSON.stringify(data) }),
    getEvents: (shipmentId: string) =>
        request(`/shipments/${shipmentId}/events`),

    // Print
    getPrintToken: (id: string) => request(`/print/${id}/token`),
    getPdfUrl: (id: string, token?: string, size?: string) => {
        const params = new URLSearchParams();
        if (token) params.set('pt', token);
        if (size) params.set('size', size);
        return `${API_URL}/print/${id}/pdf?${params.toString()}`;
    },
    getZplUrl: (id: string, token?: string) => `${API_URL}/print/${id}/zpl${token ? `?pt=${token}` : ''}`,
    getPrintSizes: () => request('/print/sizes'),

    // Config
    getBranches: () => request('/config/branches'),
    createBranch: (data: any) =>
        request('/config/branches', { method: 'POST', body: JSON.stringify(data) }),
    updateBranch: (id: string, data: any) =>
        request(`/config/branches/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteBranch: (id: string) =>
        request(`/config/branches/${id}`, { method: 'DELETE' }),

    getTemplates: () => request('/config/print-templates'),
    createTemplate: (data: any) =>
        request('/config/print-templates', { method: 'POST', body: JSON.stringify(data) }),
    updateTemplate: (id: string, data: any) =>
        request(`/config/print-templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteTemplate: (id: string) =>
        request(`/config/print-templates/${id}`, { method: 'DELETE' }),

    getUsers: () => request('/config/users'),
    createUser: (data: any) =>
        request('/config/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: string, data: any) =>
        request(`/config/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
        request(`/config/users/${id}`, { method: 'DELETE' }),

    // Tracking
    track: (trackingNumber: string) =>
        request(`/tracking/${trackingNumber}`),
};
