import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/* SVG Icons */
const Icons = {
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    alertTriangle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
};

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

export default function DashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('ep_user') || '{}');

    useEffect(() => {
        setLoading(true);
        Promise.all([api.dashboard(), api.getShipments('limit=8')])
            .then(([s, sh]) => { setStats(s); setShipments(Array.isArray(sh) ? sh.slice(0, 8) : (sh.data || []).slice(0, 8)); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const kpis = [
        { label: 'Total envios', value: stats?.total ?? '—', icon: Icons.package, color: 'blue', link: '/shipments' },
        { label: 'En transito', value: stats?.inTransit ?? '—', icon: Icons.truck, color: 'amber', link: '/shipments?status=IN_TRANSIT' },
        { label: 'Entregados', value: stats?.delivered ?? '—', icon: Icons.check, color: 'green', link: '/shipments?status=DELIVERED' },
        { label: 'Incidencias', value: stats?.incidences ?? '—', icon: Icons.alertTriangle, color: 'red', link: '/shipments?status=INCIDENCE' },
    ];

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">
                        Bienvenido, {user.name?.split(' ')[0] || 'Usuario'}
                    </h1>
                </div>
                <div className="topbar-right">
                    <button className="btn btn-primary" onClick={() => navigate('/shipments/new')}>
                        {Icons.plus}
                        <span>Nueva guia</span>
                    </button>
                </div>
            </div>

            <div className="page-content">
                {/* KPIs */}
                <div className="kpi-grid">
                    {kpis.map((kpi, i) => (
                        <div
                            className="kpi-card"
                            key={i}
                            onClick={() => navigate(kpi.link)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={`kpi-icon ${kpi.color}`}>{kpi.icon}</div>
                            <div className="kpi-info">
                                <div className="kpi-value">{kpi.value}</div>
                                <div className="kpi-label">{kpi.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Shipments */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Envios recientes</span>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate('/shipments')}>
                            Ver todos
                        </button>
                    </div>
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tracking</th>
                                    <th>Destinatario</th>
                                    <th>Destino</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Cargando...</td></tr>
                                ) : shipments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty-state">
                                                <div className="empty-state-icon">{Icons.package}</div>
                                                <div className="empty-state-text">Sin envios registrados</div>
                                                <div className="empty-state-desc">Crea tu primera guia para comenzar</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    shipments.map((s: any) => (
                                        <tr key={s.id}>
                                            <td><strong style={{ color: 'var(--primary)', letterSpacing: 0.3 }}>{s.trackingNumber}</strong></td>
                                            <td>{s.recipientName}</td>
                                            <td style={{ fontSize: 13 }}>{s.recipientAddress?.city || '—'}</td>
                                            <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-registered'}`}>{STATUS_LABELS[s.status] || s.status}</span></td>
                                            <td style={{ fontSize: 13 }}>{formatDate(s.createdAt)}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" onClick={() => navigate(`/shipments/${s.id}`)}>
                                                    {Icons.eye}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
