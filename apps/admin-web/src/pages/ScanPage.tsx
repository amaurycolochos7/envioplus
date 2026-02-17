import { useState } from 'react';
import { api } from '../services/api';

const STATUS_LABELS: Record<string, string> = {
    CREATED: 'Creado', PICKED_UP: 'Recolectado', RECEIVED_AT_ORIGIN: 'Recibido en origen',
    IN_TRANSIT: 'En tránsito', AT_DESTINATION_BRANCH: 'En sucursal destino',
    OUT_FOR_DELIVERY: 'En reparto', DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado', INCIDENCE: 'Incidencia',
    REGISTERED: 'Creado', IN_WAREHOUSE: 'Recibido en origen',
};

const STATUS_BADGE: Record<string, string> = {
    CREATED: 'badge-registered', PICKED_UP: 'badge-picked-up', RECEIVED_AT_ORIGIN: 'badge-in-warehouse',
    IN_TRANSIT: 'badge-in-transit', AT_DESTINATION_BRANCH: 'badge-in-transit',
    OUT_FOR_DELIVERY: 'badge-out-for-delivery',
    DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled', INCIDENCE: 'badge-incidence',
    REGISTERED: 'badge-registered', IN_WAREHOUSE: 'badge-in-warehouse',
};

const Icons = {
    scan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

const QUICK_ACTIONS = [
    { status: 'PICKED_UP', label: 'Recolectado', icon: Icons.package },
    { status: 'RECEIVED_AT_ORIGIN', label: 'Recibido en origen', icon: Icons.home },
    { status: 'IN_TRANSIT', label: 'En tránsito', icon: Icons.truck },
    { status: 'OUT_FOR_DELIVERY', label: 'En reparto', icon: Icons.mapPin },
    { status: 'DELIVERED', label: 'Entregado', icon: Icons.check },
];

export default function ScanPage() {
    const [tracking, setTracking] = useState('');
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tracking.trim()) return;
        setLoading(true);
        setError('');
        setShipment(null);
        setSuccessMsg('');
        try {
            const results = await api.getShipments(`search=${encodeURIComponent(tracking.trim())}`);
            const list = Array.isArray(results) ? results : (results.data || []);
            if (list.length === 0) { setError('Envio no encontrado'); return; }
            setShipment(list[0]);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleQuickAction = async (status: string) => {
        if (!shipment) return;
        try {
            await api.addEvent(shipment.id, { status });
            setSuccessMsg(`Estado actualizado a: ${STATUS_LABELS[status]}`);
            // Refresh
            const results = await api.getShipments(`search=${encodeURIComponent(shipment.trackingNumber)}`);
            const list = Array.isArray(results) ? results : (results.data || []);
            if (list.length > 0) setShipment(list[0]);
        } catch (err: any) { alert(err.message); }
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Escaneo rapido</h1>
                </div>
            </div>

            <div className="page-content">
                <div className="scan-container">
                    {/* Scan Input */}
                    <div className="scan-input-wrapper">
                        <form className="scan-input-group" onSubmit={handleSearch}>
                            <input
                                className="form-input"
                                placeholder="Ingresa o escanea numero de tracking"
                                value={tracking}
                                onChange={(e) => setTracking(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {Icons.search}
                            </button>
                        </form>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {successMsg && <div className="alert alert-success">{successMsg}</div>}

                    {/* Shipment Summary */}
                    {shipment && (
                        <div className="card">
                            <div className="card-header">
                                <span className="card-title" style={{ letterSpacing: 0.3 }}>{shipment.trackingNumber}</span>
                                <span className={`badge ${STATUS_BADGE[shipment.status] || 'badge-registered'}`}>
                                    {STATUS_LABELS[shipment.status] || shipment.status}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Remitente</span>
                                        <span className="detail-value">{shipment.senderName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Destinatario</span>
                                        <span className="detail-value">{shipment.recipientName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Destino</span>
                                        <span className="detail-value">{shipment.recipientAddress?.city || '—'}, {shipment.recipientAddress?.state || ''}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Tipo</span>
                                        <span className="detail-value">{shipment.serviceType}</span>
                                    </div>
                                </div>

                                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)', color: 'var(--text)' }}>
                                    Acciones rapidas
                                </h4>
                                <div className="quick-actions">
                                    {QUICK_ACTIONS.map(a => (
                                        <button
                                            key={a.status}
                                            className="quick-action-btn"
                                            onClick={() => handleQuickAction(a.status)}
                                            disabled={shipment.status === a.status}
                                            style={shipment.status === a.status ? { opacity: 0.4 } : {}}
                                        >
                                            {a.icon}
                                            {a.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Default state */}
                    {!shipment && !error && !loading && (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">{Icons.scan}</div>
                                <div className="empty-state-text">Escanea o ingresa un tracking</div>
                                <div className="empty-state-desc">
                                    Usa un lector de codigo de barras o escribe el numero manualmente
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
