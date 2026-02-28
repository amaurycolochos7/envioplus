import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

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

const EyeIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const PrinterIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>;
const PlusIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SearchIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const PackageIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const LinkIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>;

export default function ShipmentsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL params
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const perPage = 15;

    // Sync state to URL
    useEffect(() => {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        if (page > 1) params.page = String(page);
        setSearchParams(params, { replace: true });
    }, [search, statusFilter, page, setSearchParams]);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        params.set('page', String(page));
        params.set('limit', String(perPage));

        api.getShipments(params.toString())
            .then((res: any) => {
                setShipments(Array.isArray(res) ? res : (res.data || []));
                setTotal(res.total || (Array.isArray(res) ? res.length : 0));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, statusFilter, page]);

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handlePrint = async (id: string) => {
        try {
            const { token } = await api.getPrintToken(id);
            window.open(api.getPdfUrl(id, token), '_blank');
        } catch (err: any) {
            alert('Error al imprimir: ' + err.message);
        }
    };

    const totalPages = Math.ceil(total / perPage) || 1;

    return (
        <>
            <div className="topbar">
                <div className="topbar-left">
                    <h1 className="topbar-title">Envios</h1>
                </div>
                <div className="topbar-right">
                    <button className="btn btn-primary" onClick={() => navigate('/shipments/new')}>
                        {PlusIcon}
                        <span>Nueva guia</span>
                    </button>
                </div>
            </div>

            <div className="page-content">
                <div className="search-bar">
                    <input
                        className="form-input"
                        placeholder="Buscar por tracking, nombre o destino..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>

                <div className="card">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tracking</th>
                                    <th>Remitente</th>
                                    <th>Destinatario</th>
                                    <th>Destino</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--muted-text)' }}>Cargando envios...</td></tr>
                                ) : shipments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="empty-state">
                                                <div className="empty-state-icon">{SearchIcon}</div>
                                                <div className="empty-state-text">No se encontraron envios</div>
                                                <div className="empty-state-desc">Intenta con otros filtros de busqueda</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    shipments.map((s: any) => (
                                        <tr key={s.id}>
                                            <td><strong style={{ color: 'var(--primary)', fontSize: 13, letterSpacing: 0.3 }}>{s.trackingNumber}</strong></td>
                                            <td style={{ fontSize: 13 }}>{s.senderName}</td>
                                            <td style={{ fontSize: 13 }}>{s.recipientName}</td>
                                            <td style={{ fontSize: 13 }}>{s.recipientAddress?.city || '—'}</td>
                                            <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-registered'}`}>{STATUS_LABELS[s.status] || s.status}</span></td>
                                            <td style={{ fontSize: 13 }}>{formatDate(s.createdAt)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-sm btn-outline" title="Ver detalle" onClick={() => navigate(`/shipments/${s.id}`)}>
                                                        {EyeIcon}
                                                    </button>
                                                    <button className="btn btn-sm btn-outline" title="Copiar link de tracking" onClick={() => { const base = import.meta.env.VITE_PUBLIC_URL || window.location.origin; navigator.clipboard.writeText(`${base}/tracking/${s.trackingNumber}`); toast('Link de tracking copiado'); }}>
                                                        {LinkIcon}
                                                    </button>
                                                    <button className="btn btn-sm btn-outline" title="Imprimir" onClick={() => handlePrint(s.id)}>
                                                        {PrinterIcon}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <span>Pagina {page} de {totalPages} ({total} envios)</span>
                            <div className="pagination-buttons">
                                <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
                                <button className="btn btn-sm btn-outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
