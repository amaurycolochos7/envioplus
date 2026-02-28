import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = '/api';

/* ─── SVG Icons ─── */
const Icons = {
    package: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    truck: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
    alertTriangle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    mapPin: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    xCircle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
};

const STATUS_LABELS: Record<string, string> = {
    CREATED: 'Creado',
    PICKED_UP: 'Recolectado',
    RECEIVED_AT_ORIGIN: 'Recibido en origen',
    IN_TRANSIT: 'En tránsito',
    AT_DESTINATION_BRANCH: 'En sucursal destino',
    OUT_FOR_DELIVERY: 'En reparto',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    INCIDENCE: 'Incidencia',
    // Alias legados
    REGISTERED: 'Creado',
    IN_WAREHOUSE: 'Recibido en origen',
};

const STATUS_CLASS: Record<string, string> = {
    DELIVERED: 'delivered',
    IN_TRANSIT: 'in-transit',
    OUT_FOR_DELIVERY: 'in-transit',
    INCIDENCE: 'incidence',
    CANCELLED: 'incidence',
};

// Logical order of statuses for determining timeline state
const STATUS_ORDER = [
    'CREATED', 'PICKED_UP', 'RECEIVED_AT_ORIGIN', 'IN_TRANSIT',
    'AT_DESTINATION_BRANCH', 'OUT_FOR_DELIVERY', 'DELIVERED'
];

export default function TrackingPage() {
    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [input, setInput] = useState(trackingNumber || '');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (trackingNumber) {
            setInput(trackingNumber);
            fetchTracking(trackingNumber);
        }
    }, [trackingNumber]);

    const fetchTracking = async (tn: string) => {
        setLoading(true);
        setError('');
        setData(null);
        try {
            const res = await fetch(`${API}/tracking/${tn}`);
            if (!res.ok) throw new Error('No se encontro el envio');
            setData(await res.json());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) navigate(`/tracking/${input.trim().toUpperCase()}`);
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    /** Get timeline state for an event: completed, current, or pending */
    const getTimelineState = (eventIndex: number, totalEvents: number) => {
        if (eventIndex === 0) return 'current';
        if (eventIndex < totalEvents) return 'completed';
        return 'pending';
    };

    return (
        <>
            {/* ─── NAVBAR ─── */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-inner">
                    <a href="/" className="navbar-logo">
                        {Icons.package}
                        EnvioPlus
                    </a>
                    <div className="navbar-links">
                        <a href="/" className="navbar-link">Inicio</a>
                        <a href="/tracking" className="navbar-cta">Rastrear envio</a>
                    </div>
                </div>
            </nav>

            <div className="tracking-page">
                {/* ─── SEARCH BANNER ─── */}
                <div className="tracking-hero">
                    <h1>Rastrear envio</h1>
                    <p>Ingresa tu numero de seguimiento para conocer el estatus de tu paquete</p>
                    <form className="tracking-search-form" onSubmit={handleSearch}>
                        <input
                            className="input input-dark"
                            placeholder="Ej: EP-XXXX-XXXX"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Buscar</button>
                    </form>
                </div>

                {/* ─── LOADING STATE ─── */}
                {loading && (
                    <div className="tracking-result-wrapper">
                        <div className="tracking-card">
                            <div className="tracking-loading">
                                <div className="spinner"></div>
                                <p>Buscando informacion del envio...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── ERROR / EMPTY STATE ─── */}
                {error && !loading && (
                    <div className="tracking-result-wrapper">
                        <div className="tracking-card">
                            <div className="tracking-empty">
                                <div className="tracking-empty-icon">
                                    {Icons.search}
                                </div>
                                <h3 className="h3" style={{ marginBottom: 8 }}>Envio no encontrado</h3>
                                <p>
                                    No encontramos resultados para ese numero de tracking.
                                    Verifica que el numero sea correcto e intenta de nuevo.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TRACKING RESULT ─── */}
                {data && !loading && (
                    <div className="tracking-result-wrapper">
                        <div className="tracking-card">
                            {/* Header */}
                            <div className="tracking-header">
                                <div className="tracking-number">{data.trackingNumber}</div>
                                <div className={`tracking-status ${STATUS_CLASS[data.status] || 'default'}`}>
                                    {STATUS_LABELS[data.status] || data.status}
                                </div>
                            </div>

                            {/* Route */}
                            <div className="tracking-route">
                                <div>
                                    <div className="muted" style={{ fontSize: 11 }}>Origen</div>
                                    <strong>{data.origin?.city || 'N/A'}, {data.origin?.state || ''}</strong>
                                </div>
                                <span className="route-arrow">{Icons.arrowRight}</span>
                                <div>
                                    <div className="muted" style={{ fontSize: 11 }}>Destino</div>
                                    <strong>{data.destination?.city || 'N/A'}, {data.destination?.state || ''}</strong>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="tracking-timeline">
                                <h3>Historial de seguimiento</h3>
                                {data.events && data.events.length > 0 ? (
                                    // Events are ordered newest-first from API
                                    data.events.map((ev: any, i: number) => {
                                        const state = getTimelineState(i, data.events.length);
                                        return (
                                            <div className={`tl-item ${state}`} key={i}>
                                                <div className="tl-dot">
                                                    {state === 'completed' && Icons.check}
                                                    {state === 'current' && (
                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                                                            <circle cx="12" cy="12" r="5" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="tl-info">
                                                    <strong>{STATUS_LABELS[ev.status] || ev.status}</strong>
                                                    <div className="tl-time">{formatDate(ev.createdAt)}</div>
                                                    {ev.branch?.name && (
                                                        <div className="tl-branch">
                                                            {Icons.mapPin}
                                                            {ev.branch.name}
                                                        </div>
                                                    )}
                                                    {ev.notes && (
                                                        <div className="tl-notes">{ev.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="muted">Aun no hay eventos de seguimiento registrados</p>
                                )}
                            </div>
                        </div>

                        {/* Security notice */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: 'var(--space-5) 0',
                            color: 'var(--muted-text)',
                            fontSize: 'var(--font-size-xs)'
                        }}>
                            <span style={{ width: 14, height: 14, display: 'inline-flex' }}>{Icons.shield}</span>
                            <span>Informacion verificada y actualizada en tiempo real</span>
                        </div>
                    </div>
                )}

                {/* Default state - no search yet */}
                {!data && !loading && !error && !trackingNumber && (
                    <div className="tracking-result-wrapper" style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
                        <div style={{ width: 48, height: 48, margin: '0 auto var(--space-4)', color: 'var(--muted-text)', opacity: 0.4 }}>
                            {Icons.package}
                        </div>
                        <p className="muted">
                            Ingresa un numero de tracking para comenzar
                        </p>
                    </div>
                )}
            </div>

            {/* ─── FOOTER ─── */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom" style={{ paddingTop: 0, borderTop: 'none' }}>
                        <span>&copy; {new Date().getFullYear()} EnvioPlus. Todos los derechos reservados.</span>
                        <div className="footer-security">
                            {Icons.shield}
                            <span>Datos protegidos con encriptacion SSL</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
