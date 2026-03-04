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
    copy: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
    ),
    refresh: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
    ),
    chevronDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    ),
    helpCircle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    boxIcon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
};

const STATUS_LABELS: Record<string, string> = {
    CREATED: 'Registrado',
    PICKED_UP: 'Recolectado',
    RECEIVED_AT_ORIGIN: 'Recibido en origen',
    IN_TRANSIT: 'En tránsito',
    AT_DESTINATION_BRANCH: 'En sucursal destino',
    OUT_FOR_DELIVERY: 'En reparto',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
    INCIDENCE: 'Incidencia',
    REGISTERED: 'Registrado',
    IN_WAREHOUSE: 'Recibido en origen',
};

const SERVICE_LABELS: Record<string, string> = {
    STANDARD: 'Estándar',
    EXPRESS: 'Express',
};

const PACKAGE_LABELS: Record<string, string> = {
    ENVELOPE: 'Sobre',
    BOX: 'Caja',
    PACKAGE: 'Paquete',
    OTHER: 'Otro',
};

const PAYMENT_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
    OTHER: 'Otro',
};

export default function TrackingPage() {
    const { trackingNumber } = useParams();
    const navigate = useNavigate();
    const [input, setInput] = useState(trackingNumber || '');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [copied, setCopied] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

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

    const handleCopy = () => {
        if (data?.trackingNumber) {
            navigator.clipboard.writeText(data.trackingNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRefresh = () => {
        if (data?.trackingNumber) {
            fetchTracking(data.trackingNumber);
        }
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatDateLong = (d: string) => {
        const date = new Date(d);
        const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('es-MX', { month: 'long' });
        const year = date.getFullYear();
        return { dayName, full: `${dayNum} De ${month.charAt(0).toUpperCase() + month.slice(1)} De ${year}` };
    };

    const formatTime = (d: string) => {
        const date = new Date(d);
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' Hora local';
    };

    const getStatusColor = (status: string) => {
        if (status === 'DELIVERED') return '#16a34a';
        if (status === 'CANCELLED' || status === 'INCIDENCE') return '#dc2626';
        if (status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY') return '#2563eb';
        return '#16a34a';
    };

    const buildFullAddress = (addr: any) => {
        if (!addr) return 'N/A';
        const parts = [
            addr.street,
            addr.number ? `#${addr.number}` : '',
            addr.neighborhood,
            addr.city,
            addr.state,
            addr.zip ? `C.P. ${addr.zip}` : '',
        ].filter(Boolean);
        return parts.join(', ');
    };

    const dims = data?.dimensions as any;

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
                        <a href="/tracking" className="navbar-cta">Rastrear envío</a>
                    </div>
                </div>
            </nav>

            <div className="trk-page">
                {/* ─── SEARCH BANNER ─── */}
                <div className="trk-hero">
                    <div className="trk-hero-inner">
                        <div className="trk-hero-text">
                            <h1>Rastrea tu envío</h1>
                            <p>Ingresa tu número de rastreo para ver el estatus y movimientos.</p>
                        </div>
                        <div className="trk-hero-badge">
                            <span className="trk-badge-dot"></span>
                            EnvioPlus
                        </div>
                    </div>
                    <form className="trk-search-form" onSubmit={handleSearch}>
                        <input
                            className="trk-search-input"
                            placeholder="Ingresa tu número de guía"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="trk-search-btn">BUSCAR</button>
                    </form>
                    {data && (
                        <div className="trk-searched-label">
                            Número consultado: <strong>{data.trackingNumber}</strong>
                        </div>
                    )}
                </div>

                {/* ─── LOADING STATE ─── */}
                {loading && (
                    <div className="trk-content">
                        <div className="trk-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: 16, color: 'var(--muted-text)' }}>Buscando información del envío...</p>
                        </div>
                    </div>
                )}

                {/* ─── ERROR STATE ─── */}
                {error && !loading && (
                    <div className="trk-content">
                        <div className="trk-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <div style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--muted-text)' }}>
                                {Icons.search}
                            </div>
                            <h3 style={{ marginBottom: 8 }}>Envío no encontrado</h3>
                            <p className="muted">
                                No encontramos resultados para ese número de tracking.
                                Verifica que el número sea correcto e intenta de nuevo.
                            </p>
                        </div>
                    </div>
                )}

                {/* ─── TRACKING RESULT ─── */}
                {data && !loading && (
                    <div className="trk-content">
                        {/* ═══ HEADER CARD ═══ */}
                        <div className="trk-card trk-header-card">
                            <div className="trk-header-top">
                                <div className="trk-handler">
                                    <span className="trk-handler-icon">{Icons.truck}</span>
                                    Envío manejado por: <strong>EnvioPlus</strong>
                                </div>
                            </div>
                            <div className="trk-header-meta">
                                <span>Código de rastreo: <strong>{data.trackingNumber}</strong></span>
                                <span className="trk-meta-sep">·</span>
                                <span>Fecha de solicitud: {formatDate(data.createdAt)}</span>
                            </div>
                        </div>

                        {/* ═══ STATUS + ESTIMATED DELIVERY ROW ═══ */}
                        <div className="trk-two-col">
                            {/* Left: Current status */}
                            <div className="trk-card trk-status-card">
                                <div className="trk-status-top">
                                    <div className="trk-status-info">
                                        <div className="trk-status-icon">
                                            {Icons.mapPin}
                                        </div>
                                        <div>
                                            <h3 className="trk-status-title">
                                                {data.events?.[0]?.branch?.name
                                                    ? `${STATUS_LABELS[data.status] || data.status} en ${data.events[0].branch.name}`
                                                    : (STATUS_LABELS[data.status] || data.status)}
                                            </h3>
                                            {data.events?.[0]?.location && (
                                                <p className="trk-status-location">{data.events[0].location}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="trk-completion">
                                        <span className="trk-completion-icon">{Icons.check}</span>
                                        Completado <strong>{data.progressPercent}%</strong>
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div className="trk-status-meta">
                                    {data.events?.[0] && (
                                        <span className="trk-meta-tag">
                                            <span className="trk-meta-dot green"></span>
                                            {formatDate(data.events[0].createdAt)} Hora local
                                        </span>
                                    )}
                                    {data.origin && (
                                        <span className="trk-meta-tag">
                                            <span className="trk-meta-dot dark"></span>
                                            {data.origin.state}
                                        </span>
                                    )}
                                    <span className="trk-meta-tag">
                                        <span className="trk-meta-dot blue"></span>
                                        {data.trackingNumber} Código de envío
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="trk-progress">
                                    <div
                                        className="trk-progress-bar"
                                        style={{ width: `${data.progressPercent}%`, background: getStatusColor(data.status) }}
                                    ></div>
                                </div>

                                {/* Status label row */}
                                <div className="trk-status-row">
                                    <span className="trk-status-label-main">
                                        {STATUS_LABELS[data.status] || data.status}
                                    </span>
                                    <span className="trk-status-hint">
                                        {Icons.refresh}
                                        Usa "Actualizar" para ver cambios recientes.
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="trk-actions">
                                    <button className="trk-btn trk-btn-outline" onClick={handleCopy}>
                                        {Icons.copy}
                                        {copied ? 'COPIADO!' : 'COPIAR GUÍA'}
                                    </button>
                                    <button className="trk-btn trk-btn-green" onClick={handleRefresh}>
                                        {Icons.refresh}
                                        ACTUALIZAR
                                    </button>
                                </div>
                            </div>

                            {/* Right: Estimated delivery + Route */}
                            <div className="trk-right-col">
                                <div className="trk-card trk-estimated-card">
                                    <div className="trk-estimated-label">ENTREGA ESTIMADA</div>
                                    <div className="trk-estimated-date">
                                        En transcurso del proceso
                                    </div>
                                    <p className="trk-estimated-disclaimer">
                                        Sujeto a validación por aduana / rutas / condiciones operativas.
                                    </p>
                                    <div className="trk-estimated-tag">
                                        # {data.trackingNumber}
                                    </div>
                                </div>

                                <div className="trk-card trk-route-card">
                                    <table className="trk-route-table">
                                        <tbody>
                                            <tr>
                                                <td className="trk-route-key">RUTA</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td className="trk-route-key">DESTINO</td>
                                                <td className="trk-route-val">
                                                    {data.destination
                                                        ? `${data.destination.street || ''} ${data.destination.number || ''}, ${data.destination.city || ''}, ${data.destination.state || ''}`
                                                        : 'N/A'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="trk-route-key">PESO</td>
                                                <td className="trk-route-val">{data.weight ? `${data.weight} g` : 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="trk-route-key">SERVICIO</td>
                                                <td className="trk-route-val">{SERVICE_LABELS[data.serviceType] || data.serviceType}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* ═══ ADDRESS + GUIDE NUMBER ROW ═══ */}
                        <div className="trk-two-col">
                            <div className="trk-card">
                                <h4 className="trk-section-title">
                                    {Icons.mapPin}
                                    DIRECCIÓN DE ENVÍO
                                </h4>
                                <div className="trk-address-body">
                                    <p><strong>{data.recipientName}</strong></p>
                                    {data.destination && (
                                        <>
                                            <p>{data.destination.street} {data.destination.number}</p>
                                            {data.destination.neighborhood && <p>{data.destination.neighborhood}</p>}
                                            <p>{data.destination.city}</p>
                                            <p>{data.destination.state}</p>
                                        </>
                                    )}
                                    {data.recipientPhone && <p><strong>Teléfono:</strong> {data.recipientPhone}</p>}
                                    <p><strong>Código de envío:</strong> {data.trackingNumber}</p>
                                </div>
                                <div className="trk-recipient-tag">
                                    <span className="trk-recipient-icon">{Icons.user}</span>
                                    <strong>{data.recipientName}</strong>
                                    <span className="trk-tag-label">Destinatario</span>
                                </div>
                            </div>

                            <div className="trk-card">
                                <h4 className="trk-section-title">
                                    {Icons.package}
                                    NO. DE GUÍA
                                </h4>
                                <div className="trk-guide-body">
                                    <div className="trk-guide-row">
                                        <h2 className="trk-guide-number">{data.trackingNumber}</h2>
                                        <button className="trk-btn trk-btn-green trk-btn-sm" onClick={handleCopy}>
                                            {Icons.copy}
                                            {copied ? 'COPIADO' : 'COPIAR'}
                                        </button>
                                    </div>
                                    <p className="muted" style={{ marginTop: 8 }}>
                                        Comparte la guía con el destinatario si la requiere.
                                    </p>
                                    <div className="trk-guide-envio">
                                        <span>Envío</span>
                                        <span>{formatDate(data.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ PAYMENT SECTION ═══ */}
                        <div className="trk-card trk-payment-card">
                            <h4 className="trk-section-title-plain">PAGO</h4>
                            <div className="trk-payment-row">
                                <div>
                                    <h3 className="trk-payment-amount">
                                        ${data.totalAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                        <span className="trk-payment-status-label">
                                            ({STATUS_LABELS[data.status] === 'Entregado' ? 'Pagado' : 'Envío Pendiente'})
                                        </span>
                                    </h3>
                                    <p className="muted">Importe registrado para completar el envío.</p>
                                </div>
                                <div className="trk-payment-actions">
                                    <span className="trk-payment-method">
                                        {PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod}
                                    </span>
                                    <button className="trk-btn-icon" title="Más información">
                                        {Icons.info}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ═══ PACKAGE DETAILS ═══ */}
                        <div className="trk-card trk-package-card">
                            <div className="trk-package-header">
                                <h4 className="trk-section-title">
                                    {Icons.boxIcon}
                                    Detalles del embarque
                                </h4>
                                <span className="trk-package-type-badge">
                                    {PACKAGE_LABELS[data.packageType] || data.packageType}
                                </span>
                            </div>

                            {/* Pieza */}
                            <div className="trk-piece">
                                <div className="trk-piece-header">
                                    <strong>Pieza 1:</strong>
                                    {data.declaredContent && (
                                        <span className="trk-piece-content">{data.declaredContent}</span>
                                    )}
                                </div>
                                <p className="trk-piece-detail">
                                    Peso: {data.weight ? `${data.weight}g` : 'N/A'}
                                    {dims && ` — Dimensiones: ${dims.length}cm x ${dims.width}cm x ${dims.height}cm`}
                                </p>
                            </div>

                            <div className="trk-package-footer">
                                <span className="trk-weight-total">
                                    WEIGHT: {data.weight ? `${data.weight} g` : 'N/A'}
                                </span>
                                <span className="trk-pieces-badge">
                                    {Icons.boxIcon}
                                    Piezas totales: 1
                                </span>
                            </div>
                        </div>

                        {/* ═══ SHIPPING HISTORY ═══ */}
                        <div className="trk-card trk-history-card">
                            <div className="trk-history-header" onClick={() => setHistoryOpen(!historyOpen)}>
                                <h4 className="trk-section-title">
                                    {Icons.clock}
                                    Historial de envío
                                </h4>
                                <button className={`trk-btn trk-btn-outline trk-btn-sm ${historyOpen ? 'open' : ''}`}>
                                    {historyOpen ? 'CERRAR' : 'ABRIR'}
                                    {Icons.chevronDown}
                                </button>
                            </div>

                            {historyOpen && (
                                <div className="trk-history-body">
                                    {data.events && data.events.length > 0 ? (
                                        data.events.map((ev: any, i: number) => {
                                            const dateInfo = formatDateLong(ev.createdAt);
                                            const showDateHeader = i === 0 ||
                                                formatDateLong(data.events[i - 1].createdAt).full !== dateInfo.full;

                                            return (
                                                <div key={i}>
                                                    {showDateHeader && (
                                                        <div className="trk-history-date-group">
                                                            <span className="trk-history-day-name">{dateInfo.dayName}</span>
                                                            <h4 className="trk-history-date">{dateInfo.full}</h4>
                                                        </div>
                                                    )}
                                                    <div className="trk-history-event">
                                                        <div className="trk-history-time">
                                                            <span className="trk-meta-dot green"></span>
                                                            {formatDate(ev.createdAt)} Hora local
                                                        </div>
                                                        <div className="trk-history-event-body">
                                                            <strong>{STATUS_LABELS[ev.status] || ev.status}</strong>
                                                            {ev.branch?.name && (
                                                                <span> en {ev.branch.name}</span>
                                                            )}
                                                            {ev.location && (
                                                                <p className="muted">{ev.location}</p>
                                                            )}
                                                            {ev.notes && (
                                                                <p className="muted">{ev.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="muted" style={{ padding: '20px 0' }}>
                                            Aún no hay eventos de seguimiento registrados
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ═══ BOTTOM ACTIONS ═══ */}
                        <div className="trk-bottom-actions">
                            <button className="trk-btn trk-btn-green trk-btn-lg">
                                {Icons.bell}
                                RECIBIR ALERTAS
                            </button>
                            <button className="trk-btn trk-btn-outline trk-btn-lg" onClick={() => setHelpOpen(true)}>
                                {Icons.helpCircle}
                                ¿NECESITAS AYUDA?
                            </button>
                        </div>

                        {/* ═══ HELP MODAL ═══ */}
                        {helpOpen && (
                            <div className="trk-modal-overlay" onClick={() => setHelpOpen(false)}>
                                <div className="trk-modal" onClick={(e) => e.stopPropagation()}>
                                    <div className="trk-modal-header">
                                        <h3>¿Necesitas ayuda?</h3>
                                        <button className="trk-modal-close" onClick={() => setHelpOpen(false)}>
                                            &times;
                                        </button>
                                    </div>
                                    <p className="trk-modal-desc">
                                        Contáctanos por cualquiera de estos medios y con gusto te ayudaremos con tu envío.
                                    </p>
                                    <div className="trk-help-options">
                                        <a href="tel:+526671234567" className="trk-help-option">
                                            <div className="trk-help-icon trk-help-icon-phone">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                            </div>
                                            <div>
                                                <strong>Llamar</strong>
                                                <span>(667) 123-4567</span>
                                            </div>
                                        </a>
                                        <a href="https://wa.me/526671234567" target="_blank" rel="noopener noreferrer" className="trk-help-option">
                                            <div className="trk-help-icon trk-help-icon-wa">
                                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                            </div>
                                            <div>
                                                <strong>WhatsApp</strong>
                                                <span>Enviar mensaje</span>
                                            </div>
                                        </a>
                                        <a href="mailto:soporte@envioplus.com" className="trk-help-option">
                                            <div className="trk-help-icon trk-help-icon-email">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                            </div>
                                            <div>
                                                <strong>Correo electrónico</strong>
                                                <span>soporte@envioplus.com</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security notice */}
                        <div className="trk-security">
                            <span className="trk-security-icon">{Icons.shield}</span>
                            Información verificada y actualizada en tiempo real
                        </div>
                    </div>
                )}

                {/* Default state — no search yet */}
                {!data && !loading && !error && !trackingNumber && (
                    <div className="trk-content" style={{ textAlign: 'center', paddingTop: 60 }}>
                        <div style={{ width: 56, height: 56, margin: '0 auto 20px', color: 'var(--muted-text)', opacity: 0.3 }}>
                            {Icons.package}
                        </div>
                        <p className="muted">Ingresa un número de tracking para comenzar</p>
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
                            <span>Datos protegidos con encriptación SSL</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
