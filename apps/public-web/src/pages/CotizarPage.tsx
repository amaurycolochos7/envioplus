import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── SVG Icons ─── */
const PkgIcons = {
    documento: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    paquete_pequeno: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    paquete_mediano: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
            <line x1="7.5" y1="4.5" x2="16.5" y2="9.5" />
        </svg>
    ),
    paquete_grande: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="6" width="22" height="14" rx="2" />
            <path d="M1 10h22" />
            <path d="M8 6v14" />
            <path d="M16 6v14" />
        </svg>
    ),
    carga: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
};

/* ─── Package type definitions ─── */
const PACKAGE_TYPES = [
    { id: 'documento', label: 'Documento', icon: PkgIcons.documento, maxKg: 1, desc: 'Sobres, contratos, facturas' },
    { id: 'paquete_pequeno', label: 'Paquete pequeño', icon: PkgIcons.paquete_pequeno, maxKg: 5, desc: 'Cajas hasta 30x30x30 cm' },
    { id: 'paquete_mediano', label: 'Paquete mediano', icon: PkgIcons.paquete_mediano, maxKg: 15, desc: 'Cajas hasta 60x60x60 cm' },
    { id: 'paquete_grande', label: 'Paquete grande', icon: PkgIcons.paquete_grande, maxKg: 30, desc: 'Bultos y cajas grandes' },
    { id: 'carga', label: 'Carga / Tarima', icon: PkgIcons.carga, maxKg: 999, desc: 'Mas de 30 kg, carga pesada' },
];

/* ─── Service types ─── */
const SERVICES = [
    { id: 'express', label: 'Express', days: '1-2 días hábiles', multiplier: 1.6 },
    { id: 'estandar', label: 'Estándar', days: '3-5 días hábiles', multiplier: 1.0 },
    { id: 'economico', label: 'Económico', days: '5-8 días hábiles', multiplier: 0.75 },
];

/* ─── Pricing logic — realistic Mexican parcel rates ─── */
function calculatePrice(weightKg: number, lengthCm: number, widthCm: number, heightCm: number, serviceMultiplier: number): number {
    // Volumetric weight (standard: L×W×H / 5000)
    const volumetricKg = (lengthCm * widthCm * heightCm) / 5000;
    const chargeableKg = Math.max(weightKg, volumetricKg);

    // Base rate tiers (per kg, in MXN)
    let baseCost: number;
    if (chargeableKg <= 1) {
        baseCost = 180; // documento
    } else if (chargeableKg <= 3) {
        baseCost = 250 + (chargeableKg - 1) * 35;
    } else if (chargeableKg <= 5) {
        baseCost = 320 + (chargeableKg - 3) * 30;
    } else if (chargeableKg <= 10) {
        baseCost = 380 + (chargeableKg - 5) * 28;
    } else if (chargeableKg <= 15) {
        baseCost = 520 + (chargeableKg - 10) * 26;
    } else if (chargeableKg <= 25) {
        baseCost = 650 + (chargeableKg - 15) * 24;
    } else if (chargeableKg <= 40) {
        baseCost = 890 + (chargeableKg - 25) * 22;
    } else {
        baseCost = 1220 + (chargeableKg - 40) * 20;
    }

    // Apply service multiplier
    const total = baseCost * serviceMultiplier;

    // Round to nearest 10
    return Math.round(total / 10) * 10;
}

export default function CotizarPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [packageType, setPackageType] = useState('');
    const [service, setService] = useState('estandar');
    const [weight, setWeight] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [result, setResult] = useState<{ price: number; service: string; days: string; weight: number } | null>(null);

    const selectedService = SERVICES.find(s => s.id === service);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        const w = parseFloat(weight) || 0.5;
        const l = parseFloat(length) || 20;
        const wd = parseFloat(width) || 15;
        const h = parseFloat(height) || 10;
        const svc = SERVICES.find(s => s.id === service)!;

        const price = calculatePrice(w, l, wd, h, svc.multiplier);
        setResult({ price, service: svc.label, days: svc.days, weight: w });
        setStep(3);
    };

    const cities = [
        'CDMX', 'Monterrey', 'Guadalajara', 'Puebla', 'Querétaro', 'Tijuana',
        'León', 'Mérida', 'Cancún', 'Veracruz', 'Oaxaca', 'Morelia',
        'Villahermosa', 'Tuxtla Gutiérrez', 'Aguascalientes', 'San Luis Potosí',
        'Chihuahua', 'Hermosillo', 'Toluca', 'Cuernavaca',
    ];

    return (
        <div className="cotizar-page">
            {/* Navbar */}
            <nav className="navbar scrolled">
                <div className="navbar-inner">
                    <a href="/" className="navbar-logo" style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>
                        <span style={{ color: '#FF6200' }}>Envio</span>Plus
                    </a>
                    <a href="/" className="navbar-cta" style={{ fontSize: 14 }}>← Volver al inicio</a>
                </div>
            </nav>

            <div className="cotizar-container">
                {/* Header */}
                <div className="cotizar-header">
                    <span className="overline">Cotización instantánea</span>
                    <h1 className="cotizar-title">Calcula el costo de tu envío</h1>
                    <p className="cotizar-subtitle">
                        Selecciona el tipo de paquete, indica las dimensiones y obtén tu cotización al instante.
                    </p>
                </div>

                {/* Progress steps */}
                <div className="cotizar-progress">
                    {[
                        { num: 1, label: 'Tipo de envío' },
                        { num: 2, label: 'Detalles' },
                        { num: 3, label: 'Cotización' },
                    ].map((s) => (
                        <div
                            key={s.num}
                            className={`progress-step ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}
                        >
                            <div className="progress-step-num">{s.num}</div>
                            <span className="progress-step-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Step 1: Package Type */}
                {step === 1 && (
                    <div className="cotizar-step">
                        <h2 className="cotizar-step-title">¿Qué vas a enviar?</h2>
                        <div className="package-type-grid">
                            {PACKAGE_TYPES.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    className={`package-type-card ${packageType === pkg.id ? 'selected' : ''}`}
                                    onClick={() => { setPackageType(pkg.id); setStep(2); }}
                                >
                                    <span className="package-type-icon">{pkg.icon}</span>
                                    <span className="package-type-label">{pkg.label}</span>
                                    <span className="package-type-desc">{pkg.desc}</span>
                                    <span className="package-type-max">Hasta {pkg.maxKg === 999 ? '∞' : pkg.maxKg + ' kg'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="cotizar-step">
                        <button className="cotizar-back" onClick={() => setStep(1)}>← Cambiar tipo de envío</button>
                        <h2 className="cotizar-step-title">Detalles del envío</h2>

                        <form className="cotizar-form" onSubmit={handleCalculate}>
                            {/* Origin / Destination */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Ciudad de origen</label>
                                    <select
                                        className="form-select"
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona origen</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ciudad de destino</label>
                                    <select
                                        className="form-select"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona destino</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="form-group">
                                <label className="form-label">Peso (kg)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Ej: 3.5"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    min="0.1"
                                    step="0.1"
                                    required
                                />
                            </div>

                            {/* Dimensions */}
                            {packageType !== 'documento' && (
                                <div className="form-row form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Largo (cm)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Largo"
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ancho (cm)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Ancho"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Alto (cm)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Alto"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Service type */}
                            <div className="form-group">
                                <label className="form-label">Tipo de servicio</label>
                                <div className="service-options">
                                    {SERVICES.map((svc) => (
                                        <button
                                            key={svc.id}
                                            type="button"
                                            className={`service-option ${service === svc.id ? 'selected' : ''}`}
                                            onClick={() => setService(svc.id)}
                                        >
                                            <span className="service-option-label">{svc.label}</span>
                                            <span className="service-option-days">{svc.days}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg cotizar-submit">
                                Calcular cotización →
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: Result */}
                {step === 3 && result && (
                    <div className="cotizar-step">
                        <div className="cotizar-result">
                            <div className="result-badge">COTIZACIÓN ESTIMADA</div>
                            <div className="result-price">
                                <span className="result-currency">$</span>
                                <span className="result-amount">{result.price.toLocaleString()}</span>
                                <span className="result-mxn">MXN</span>
                            </div>
                            <p className="result-iva">+ IVA (16%): <strong>${Math.round(result.price * 0.16).toLocaleString()} MXN</strong></p>
                            <p className="result-total">Total con IVA: <strong>${Math.round(result.price * 1.16).toLocaleString()} MXN</strong></p>

                            <div className="result-details">
                                <div className="result-detail">
                                    <span className="result-detail-label">Tipo de envío</span>
                                    <span className="result-detail-value">
                                        {PACKAGE_TYPES.find(p => p.id === packageType)?.label}
                                    </span>
                                </div>
                                <div className="result-detail">
                                    <span className="result-detail-label">Servicio</span>
                                    <span className="result-detail-value">{result.service}</span>
                                </div>
                                <div className="result-detail">
                                    <span className="result-detail-label">Tiempo estimado</span>
                                    <span className="result-detail-value">{result.days}</span>
                                </div>
                                <div className="result-detail">
                                    <span className="result-detail-label">Peso</span>
                                    <span className="result-detail-value">{result.weight} kg</span>
                                </div>
                                {origin && (
                                    <div className="result-detail">
                                        <span className="result-detail-label">Ruta</span>
                                        <span className="result-detail-value">{origin} → {destination}</span>
                                    </div>
                                )}
                            </div>

                            <div className="result-actions">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => {
                                        const msg = `Hola, quiero enviar un ${PACKAGE_TYPES.find(p => p.id === packageType)?.label} de ${result.weight}kg de ${origin} a ${destination}. La cotización fue $${result.price} MXN (${result.service}). ¿Cómo procedo?`;
                                        window.open(`https://wa.me/528110000000?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                >
                                    Solicitar envio por WhatsApp
                                </button>
                                <button className="btn btn-secondary" onClick={() => { setStep(1); setResult(null); }}>
                                    Nueva cotización
                                </button>
                            </div>

                            <p className="result-disclaimer">
                                * Precios estimados sujetos a confirmación. El costo final puede variar según
                                condiciones del envío, zonas extendidas y servicios adicionales.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
