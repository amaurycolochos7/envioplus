import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── SVG Icon Components ─── */
const Icons = {
    package: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    alertTriangle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    xCircle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    phone: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    barChart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
    ),
    shoppingBag: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    zap: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    printer: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [tracking, setTracking] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const revealRefs = useRef<HTMLElement[]>([]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Intersection observer for scroll reveal
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        revealRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const addRevealRef = (el: HTMLElement | null) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (tracking.trim()) navigate(`/tracking/${tracking.trim().toUpperCase()}`);
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
                        <a href="#como-funciona" className="navbar-link">Como funciona</a>
                        <a href="#beneficios" className="navbar-link">Beneficios</a>
                        <a href="#contacto" className="navbar-link">Contacto</a>
                        <a href="/tracking" className="navbar-cta">Rastrear envio</a>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-content">
                        <span className="overline">Logistica profesional</span>
                        <h1 className="hero-title">
                            Logistica confiable para envios que no pueden fallar
                        </h1>
                        <p className="hero-subtitle">
                            Seguimiento en tiempo real, control total y entregas verificadas.
                            Tu paquete siempre localizado, tu operacion siempre en orden.
                        </p>
                        <div className="hero-tracking">
                            <form className="hero-tracking-form" onSubmit={handleTrack}>
                                <input
                                    className="input-dark"
                                    placeholder="Ingresa tu numero de tracking"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                />
                                <button type="submit" className="btn btn-white">Rastrear</button>
                            </form>
                        </div>
                        <div className="hero-actions">
                            <a href="/tracking" className="btn btn-primary btn-lg">
                                Rastrear mi envio
                                {Icons.arrowRight}
                            </a>
                            <a href="#como-funciona" className="btn btn-ghost btn-lg">
                                Conocer mas
                            </a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-wrapper">
                            {/* Floating stat cards */}
                            <div className="hero-float-card hero-float-1">
                                <div className="float-icon">{Icons.check}</div>
                                <div>
                                    <div className="float-value">99.2%</div>
                                    <div className="float-text">Entregas exitosas</div>
                                </div>
                            </div>
                            <div className="hero-float-card hero-float-2">
                                <div className="float-icon">{Icons.clock}</div>
                                <div>
                                    <div className="float-value">24/7</div>
                                    <div className="float-text">Tracking disponible</div>
                                </div>
                            </div>
                            {/* Placeholder visual block */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '4/3',
                                borderRadius: 'var(--radius-xl)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ width: 64, height: 64, color: 'rgba(255,255,255,0.2)' }}>
                                    {Icons.truck}
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 14, fontWeight: 500 }}>
                                    Centro logistico
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── TRUST BAR ─── */}
            <section className="trust-bar">
                <div className="trust-bar-inner">
                    {[
                        { icon: Icons.eye, text: 'Seguimiento en tiempo real' },
                        { icon: Icons.check, text: 'Entrega verificada' },
                        { icon: Icons.phone, text: 'Atencion por WhatsApp' },
                        { icon: Icons.printer, text: 'Guias reimprimibles' },
                        { icon: Icons.shield, text: 'Trazabilidad completa' },
                    ].map((item, i) => (
                        <div className="trust-chip" key={i}>
                            {item.icon}
                            <span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── PROBLEM SECTION (StoryBrand) ─── */}
            <section className="section problem-section" ref={addRevealRef}>
                <div className="container reveal" ref={addRevealRef}>
                    <div className="section-header">
                        <span className="overline">El problema</span>
                        <h2 className="h2">Enviar paquetes no deberia ser una incertidumbre</h2>
                        <p className="lead">
                            Muchos negocios pierden clientes y dinero por problemas logisticos
                            que podrian evitarse.
                        </p>
                    </div>
                    <div className="problem-grid">
                        {[
                            { icon: Icons.clock, title: 'Retrasos constantes', desc: 'Entregas fuera de tiempo que afectan tu reputacion y la confianza de tus clientes.' },
                            { icon: Icons.xCircle, title: 'Sin seguimiento real', desc: 'Tu cliente pregunta "donde esta mi paquete" y no tienes respuesta clara.' },
                            { icon: Icons.alertTriangle, title: 'Perdidas y danos', desc: 'Paquetes extraviados o danados sin un proceso claro de resolucion.' },
                            { icon: Icons.phone, title: 'Mala comunicacion', desc: 'Falta de notificaciones, actualizaciones tardias y ningun canal directo.' },
                        ].map((item, i) => (
                            <div className="card problem-card" key={i}>
                                <div className="problem-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── AUTHORITY (Cialdini) ─── */}
            <section className="section authority-section" ref={addRevealRef}>
                <div className="container authority-content">
                    <div className="section-header reveal" ref={addRevealRef} style={{ marginBottom: 'var(--space-10)' }}>
                        <span className="overline" style={{ color: 'var(--accent)' }}>Resultados que hablan</span>
                        <h2 className="h2" style={{ color: 'white' }}>Infraestructura real, no promesas</h2>
                        <p className="lead" style={{ color: 'var(--text-on-dark-muted)' }}>
                            Numeros respaldados por operaciones reales y clientes que confian en nosotros.
                        </p>
                    </div>
                    <div className="authority-stats reveal" ref={addRevealRef}>
                        <div className="stat-card">
                            <div className="stat-value">2,500+</div>
                            <div className="stat-label">Entregas registradas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">15+</div>
                            <div className="stat-label">Zonas de cobertura</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">100%</div>
                            <div className="stat-label">Tracking en tiempo real</div>
                        </div>
                    </div>

                    {/* Client types — NOT fake logos */}
                    <div className="client-types reveal" ref={addRevealRef}>
                        <div className="client-types-title">Tipo de clientes que confian en nosotros</div>
                        <div className="client-types-grid">
                            {[
                                { icon: Icons.shoppingBag, label: 'E-commerce' },
                                { icon: Icons.settings, label: 'Refacciones' },
                                { icon: Icons.package, label: 'Boutiques' },
                                { icon: Icons.barChart, label: 'Empresas' },
                                { icon: Icons.printer, label: 'Documentos' },
                            ].map((c, i) => (
                                <div className="client-type" key={i}>
                                    <div className="client-type-icon">{c.icon}</div>
                                    <span>{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="testimonials reveal" ref={addRevealRef}>
                        {[
                            {
                                text: 'Antes perdiamos 2 de cada 10 envios porque no sabiamos donde estaban. Con EnvioPlus, cada paquete tiene trazabilidad completa.',
                                name: 'Roberto M.', role: 'Dueño de tienda en linea', initials: 'RM'
                            },
                            {
                                text: 'Nuestros clientes ahora pueden rastrear sus pedidos ellos mismos. Redujo un 70% las llamadas preguntando por estatus.',
                                name: 'Laura G.', role: 'Coordinadora logistica', initials: 'LG'
                            },
                            {
                                text: 'La guia se genera en segundos, el tracking funciona y la entrega se confirma. Asi de simple deberia ser.',
                                name: 'Carlos V.', role: 'Gerente de operaciones', initials: 'CV'
                            },
                        ].map((t, i) => (
                            <div className="testimonial-card" key={i}>
                                <p className="testimonial-text">"{t.text}"</p>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.initials}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="section how-section" id="como-funciona" ref={addRevealRef}>
                <div className="container">
                    <div className="section-header reveal" ref={addRevealRef}>
                        <span className="overline">Proceso simple</span>
                        <h2 className="h2">Como funciona EnvioPlus</h2>
                        <p className="lead">
                            4 pasos. Sin complicaciones. Sin letra chica.
                        </p>
                    </div>
                    <div className="steps-grid reveal" ref={addRevealRef}>
                        {[
                            { num: '01', title: 'Registra tu envio', desc: 'Captura los datos del remitente y destinatario en el panel.' },
                            { num: '02', title: 'Genera la guia', desc: 'Se crea automaticamente con numero de tracking unico.' },
                            { num: '03', title: 'Rastrea en tiempo real', desc: 'Tu y tu cliente pueden seguir el paquete en cada etapa.' },
                            { num: '04', title: 'Entrega confirmada', desc: 'Recibe confirmacion de entrega con evidencia digital.' },
                        ].map((step, i) => (
                            <div className="step-card" key={i}>
                                <div className="step-number">{step.num}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── BENEFITS ─── */}
            <section className="section benefits-section" id="beneficios" ref={addRevealRef}>
                <div className="container">
                    <div className="section-header reveal" ref={addRevealRef}>
                        <span className="overline">Beneficios operativos</span>
                        <h2 className="h2">Lo que ganas con EnvioPlus</h2>
                        <p className="lead">No features tecnicos. Resultados reales para tu operacion.</p>
                    </div>
                    <div className="benefits-grid reveal" ref={addRevealRef}>
                        {[
                            { icon: Icons.eye, title: 'Control total', desc: 'Visibilidad completa de cada envio, desde la recoleccion hasta la entrega final.' },
                            { icon: Icons.shield, title: 'Imagen profesional', desc: 'Guias impresas, tracking publico y proceso verificado. Tu cliente confia mas.' },
                            { icon: Icons.zap, title: 'Reduccion de errores', desc: 'Sistema que valida datos y automatiza la trazabilidad. Menos llamadas, menos problemas.' },
                            { icon: Icons.barChart, title: 'Optimizacion logistica', desc: 'Reportes, metricas y datos para tomar mejores decisiones operativas.' },
                            { icon: Icons.truck, title: 'Operacion escalable', desc: 'Multi-sucursal, multi-usuario. Crece sin cambiar de herramienta.' },
                            { icon: Icons.lock, title: 'Seguridad garantizada', desc: 'Datos protegidos, acceso controlado por roles y bitacora completa de cada movimiento.' },
                        ].map((b, i) => (
                            <div className="benefit-card" key={i}>
                                <div className="benefit-icon">{b.icon}</div>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA FINAL ─── */}
            <section className="section cta-section" ref={addRevealRef}>
                <div className="container">
                    <div className="cta-content reveal" ref={addRevealRef}>
                        <h2 className="h2">Listo para profesionalizar tu logistica?</h2>
                        <p className="lead">
                            Deja de improvisar. Controla tus envios con la infraestructura
                            que tu negocio necesita.
                        </p>
                        <div className="cta-buttons">
                            <a href="/tracking" className="btn btn-white btn-lg">
                                Rastrear un envio
                            </a>
                            <a href="#contacto" className="btn btn-ghost btn-lg">
                                Contactar ventas
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="footer" id="contacto">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                {Icons.package}
                                EnvioPlus
                            </div>
                            <p className="footer-desc">
                                Servicio de paqueteria y mensajeria con seguimiento en tiempo real.
                                Infraestructura logistica confiable para negocios que exigen resultados.
                            </p>
                            <div className="footer-security">
                                {Icons.shield}
                                <span>Datos protegidos con encriptacion SSL</span>
                            </div>
                        </div>
                        <div className="footer-col">
                            <h4>Servicio</h4>
                            <ul className="footer-links">
                                <li><a href="/tracking">Rastrear envio</a></li>
                                <li><a href="#como-funciona">Como funciona</a></li>
                                <li><a href="#beneficios">Beneficios</a></li>
                                <li><a href="#">Cobertura</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Empresa</h4>
                            <ul className="footer-links">
                                <li><a href="#">Sobre nosotros</a></li>
                                <li><a href="#">Politica de servicio</a></li>
                                <li><a href="#">Aviso de privacidad</a></li>
                                <li><a href="#">Terminos y condiciones</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Contacto</h4>
                            <ul className="footer-links">
                                <li><a href="#">contacto@envioplus.com.mx</a></li>
                                <li><a href="#">+52 (XXX) XXX-XXXX</a></li>
                                <li><a href="#">Av. Principal #123, Col. Centro</a></li>
                                <li><a href="#">Ciudad, Estado, Mexico</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <a href="http://localhost:5175/login" style={{ color: 'inherit', textDecoration: 'none' }} title="Panel de administracion">&copy; {new Date().getFullYear()} EnvioPlus. Todos los derechos reservados.</a>
                        <div className="footer-bottom-links">
                            <a href="#">Privacidad</a>
                            <a href="#">Terminos</a>
                            <a href="#">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
