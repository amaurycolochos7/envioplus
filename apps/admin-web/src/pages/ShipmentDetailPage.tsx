import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// ─── Alineado con el enum ShipmentStatus de Prisma ───────
const STATUS_LABELS: Record<string, string> = {
    CREATED: 'Creado', PICKED_UP: 'Recolectado', RECEIVED_AT_ORIGIN: 'Recibido en origen',
    IN_TRANSIT: 'En tránsito', AT_DESTINATION_BRANCH: 'En sucursal destino',
    OUT_FOR_DELIVERY: 'En reparto', DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado', INCIDENCE: 'Incidencia',
    // Alias legados (DB viejo)
    REGISTERED: 'Creado', IN_WAREHOUSE: 'Recibido en origen',
};

const STATUS_BADGE: Record<string, string> = {
    CREATED: 'badge-registered', PICKED_UP: 'badge-picked-up', RECEIVED_AT_ORIGIN: 'badge-in-warehouse',
    IN_TRANSIT: 'badge-in-transit', AT_DESTINATION_BRANCH: 'badge-in-transit',
    OUT_FOR_DELIVERY: 'badge-out-for-delivery',
    DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled', INCIDENCE: 'badge-incidence',
    // Alias legados (DB viejo)
    REGISTERED: 'badge-registered', IN_WAREHOUSE: 'badge-in-warehouse',
};

// Orden secuencial del flujo — solo se puede avanzar, nunca retroceder
const STATUS_ORDER = [
    'CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN', 'IN_TRANSIT',
    'AT_DESTINATION_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const Icons = {
    arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    printer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
    alertTriangle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    xCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12" /></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
};

export default function ShipmentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const load = () => {
        setLoading(true);
        api.getShipment(id!).then(setData).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [id]);

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        setActionLoading(true);
        try {
            await api.addEvent(id!, { status: newStatus, notes });
            setShowStatusModal(false);
            setNewStatus('');
            setNotes('');
            load();
        } catch (err: any) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleIncident = async () => {
        setActionLoading(true);
        try {
            await api.addEvent(id!, { status: 'INCIDENCE', notes });
            setShowIncidentModal(false);
            setNotes('');
            load();
        } catch (err: any) { alert(err.message); }
        finally { setActionLoading(false); }
    };

    const handleCancel = async () => {
        if (!confirm('Cancelar este envio? Esta accion no se puede deshacer.')) return;
        try {
            await api.cancelShipment(id!, 'Cancelado por operador');
            load();
        } catch (err: any) { alert(err.message); }
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatAddress = (addr: any) => {
        if (!addr) return '—';
        return `${addr.street} ${addr.number}, ${addr.neighborhood}, ${addr.city}, ${addr.state} C.P. ${addr.zip}`;
    };

    const handleDownload = async () => {
        try {
            const { token } = await api.getPrintToken(id!);
            const url = api.getPdfUrl(id!, token, 'HALF_LETTER');
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `guia-${data?.trackingNumber || 'envioplus'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            alert('Error al descargar: ' + err.message);
        }
    };

    // Solo mostrar estatus posteriores al actual
    const getNextStatuses = () => {
        if (!data) return [];
        // Mapear estatus heredados del DB a los nuevos
        const LEGACY_MAP: Record<string, string> = {
            REGISTERED: 'CREATED',
            IN_WAREHOUSE: 'RECEIVED_AT_ORIGIN',
        };
        const current = LEGACY_MAP[data.status] || data.status;
        const currentIdx = STATUS_ORDER.indexOf(current);
        if (currentIdx === -1) return STATUS_ORDER; // fallback
        return STATUS_ORDER.slice(currentIdx + 1);
    };

    if (loading) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Cargando...</h1></div></div>
                <div className="page-content"><div className="card card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--muted-text)' }}>Cargando detalle del envio...</div></div>
            </>
        );
    }

    if (!data) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Envio no encontrado</h1></div></div>
                <div className="page-content">
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">{Icons.package}</div>
                            <div className="empty-state-text">No se encontro el envio</div>
                            <button className="btn btn-outline mt-4" onClick={() => navigate('/shipments')}>Volver a envios</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Topbar */}
            <div className="topbar">
                <div className="topbar-left" style={{ gap: 12 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate('/shipments')}>{Icons.arrowLeft}</button>
                    <h1 className="topbar-title">{data.trackingNumber}</h1>
                    <span className={`badge ${STATUS_BADGE[data.status] || 'badge-registered'}`}>{STATUS_LABELS[data.status] || data.status}</span>
                </div>
                <div className="topbar-right" style={{ gap: 8 }}>
                    <button className="btn btn-sm btn-outline" onClick={handleDownload}>{Icons.download} Descargar guía</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => { setShowStatusModal(true); }}>{Icons.refresh} Actualizar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => { setShowIncidentModal(true); }}>{Icons.alertTriangle} Incidencia</button>
                    {data.status !== 'CANCELLED' && data.status !== 'DELIVERED' && (
                        <button className="btn btn-sm btn-danger" onClick={handleCancel}>{Icons.xCircle} Cancelar</button>
                    )}
                </div>
            </div>

            <div className="page-content">
                {/* Info Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                    {/* Sender */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 18, height: 18, color: 'var(--primary)' }}>{Icons.user}</span>
                                Remitente
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="detail-grid">
                                <div className="detail-item"><span className="detail-label">Nombre</span><span className="detail-value">{data.senderName}</span></div>
                                <div className="detail-item"><span className="detail-label">Telefono</span><span className="detail-value">{data.senderPhone}</span></div>
                                {data.senderEmail && <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{data.senderEmail}</span></div>}
                            </div>
                            <div className="detail-item mt-4">
                                <span className="detail-label">Direccion</span>
                                <span className="detail-value" style={{ fontSize: 13 }}>{formatAddress(data.senderAddress)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recipient */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 18, height: 18, color: 'var(--cta)' }}>{Icons.mapPin}</span>
                                Destinatario
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="detail-grid">
                                <div className="detail-item"><span className="detail-label">Nombre</span><span className="detail-value">{data.recipientName}</span></div>
                                <div className="detail-item"><span className="detail-label">Telefono</span><span className="detail-value">{data.recipientPhone}</span></div>
                                {data.recipientEmail && <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{data.recipientEmail}</span></div>}
                            </div>
                            <div className="detail-item mt-4">
                                <span className="detail-label">Direccion</span>
                                <span className="detail-value" style={{ fontSize: 13 }}>{formatAddress(data.recipientAddress)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package & Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
                    {/* Package Info */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 18, height: 18, color: 'var(--primary)' }}>{Icons.package}</span>
                                Paquete
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="detail-grid">
                                <div className="detail-item"><span className="detail-label">Tipo</span><span className="detail-value">{data.packageType}</span></div>
                                <div className="detail-item"><span className="detail-label">Peso</span><span className="detail-value">{data.weight ? `${data.weight} kg` : '—'}</span></div>
                                <div className="detail-item"><span className="detail-label">Servicio</span><span className="detail-value">{data.serviceType}</span></div>
                                <div className="detail-item"><span className="detail-label">Total</span><span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>${data.totalAmount || 0}</span></div>
                                {data.declaredContent && <div className="detail-item"><span className="detail-label">Contenido</span><span className="detail-value">{data.declaredContent}</span></div>}
                                {data.insurance && <div className="detail-item"><span className="detail-label">Seguro</span><span className="detail-value badge-cta" style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 12 }}>Asegurado</span></div>}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Historial</span>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                {data.events && data.events.length > 0 ? (
                                    data.events.map((ev: any, i: number) => (
                                        <div className="timeline-item" key={i}>
                                            <div className={`timeline-dot ${i === 0 ? 'active' : ''}`}>
                                                {i === 0 ? <svg viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="3" /></svg> : Icons.check}
                                            </div>
                                            <div className="timeline-info">
                                                <strong>{STATUS_LABELS[ev.status] || ev.status}</strong>
                                                <div className="timeline-meta">
                                                    {formatDate(ev.timestamp)}
                                                    {ev.branchName && ` — ${ev.branchName}`}
                                                </div>
                                                {ev.notes && <div className="timeline-meta" style={{ fontStyle: 'italic' }}>{ev.notes}</div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted text-sm">Sin eventos registrados</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Actualizar estado</h3>
                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label">Nuevo estado</label>
                            <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {getNextStatuses().map((k) => (
                                    <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notas (opcional)</label>
                            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones..." />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowStatusModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={!newStatus || actionLoading}>
                                {actionLoading ? 'Guardando...' : 'Actualizar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Incident Modal */}
            {showIncidentModal && (
                <div className="modal-overlay" onClick={() => setShowIncidentModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Reportar incidencia</h3>
                        <div className="form-group">
                            <label className="form-label">Descripcion de la incidencia</label>
                            <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe el problema..." />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowIncidentModal(false)}>Cancelar</button>
                            <button className="btn btn-danger" onClick={handleIncident} disabled={!notes || actionLoading}>
                                {actionLoading ? 'Reportando...' : 'Reportar incidencia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
