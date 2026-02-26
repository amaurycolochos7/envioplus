import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Solid SVG Icon Components (Industrial) ─── */
const Icons = {
    package: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 16l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" /></svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>
    ),
    alertTriangle: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
    ),
    xCircle: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
    ),
    search: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
    ),
    truck: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
    ),
    mapPin: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
    ),
    phone: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
    ),
    barChart: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" /></svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49,0,0,0,.12-.61l-1.92-3.32a.49.49,0,0,0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4,2.81a.47.47,0,0,0-.48-.41h-3.84c-.24,0-.43.17-.47.41L9.25,5.35A7.49,7.49,0,0,0,7.63,6.29l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03,1.58a.49.49,0,0,0-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61L19.14,12.94zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" /></svg>
    ),
    zap: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
    ),
    fingerprint: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.72 2.54.72.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.11-1.21.11zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.49.38z" /></svg>
    ),
    camera: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0" /><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" /></svg>
    ),
    edit: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
    ),
    verified: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></svg>
    ),
    target: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-8c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" /></svg>
    ),
    handshake: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.22 19.85c-.18.18-.5.21-.71 0L3.2 11.54c-.2-.2-.2-.51 0-.71l2.12-2.12 3.54 3.54 5.66-5.66 3.54 3.54-2.12 2.12-3.54-3.54-.71.71 3.54 3.54-2.12 2.12-3.54-3.54-.71.71 3.54 3.54-2.12 2.12z" /><path d="M19.78 11.78l-1.06-1.06 2.12-2.12c.2-.2.2-.51 0-.71L17.66 4.7c-.2-.2-.51-.2-.71 0L14.83 6.83l-1.06-1.06 2.12-2.12c.78-.78 2.05-.78 2.83 0l3.18 3.18c.78.78.78 2.05 0 2.83l-2.12 2.12zM6.34 19.3c-.78.78-2.05.78-2.83 0L.33 16.12c-.78-.78-.78-2.05 0-2.83l2.12-2.12 1.06 1.06-2.12 2.12c-.2.2-.2.51 0 .71l3.18 3.18c.2.2.51.2.71 0l2.12-2.12 1.06 1.06-2.12 2.12z" /></svg>
    ),
    building: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" /></svg>
    ),
    shoppingBag: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" /></svg>
    ),
    document: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
    ),
};

/* ─── Brand Logo Component ─── */
const BrandLogo = ({ variant = 'default', size = 'md' }: { variant?: 'default' | 'white' | 'dark'; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = { sm: { icon: 22, text: 16, gap: 6 }, md: { icon: 28, text: 20, gap: 8 }, lg: { icon: 36, text: 26, gap: 10 } };
    const s = sizes[size];
    const fill = variant === 'white' ? 'white' : variant === 'dark' ? '#1A0A3E' : 'currentColor';
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
            <svg viewBox="0 0 48 48" fill="none" style={{ width: s.icon, height: s.icon }}>
                <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" fill="#4D148C" opacity="0.15" />
                <path d="M24 4L6 14l18 10 18-10L24 4z" fill="#4D148C" opacity="0.3" />
                <path d="M24 24v20l18-10V14L24 24z" fill="#4D148C" opacity="0.6" />
                <path d="M24 24v20L6 34V14l18 10z" fill="#4D148C" />
                <path d="M16 21l6-5 6 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M22 16l4 0 0 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
                <rect x="35" y="2" width="11" height="11" rx="3" fill="#FF6200" />
                <line x1="40.5" y1="4.5" x2="40.5" y2="10.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="37.5" y1="7.5" x2="43.5" y2="7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: s.text, fontWeight: 800, letterSpacing: '-0.02em', color: fill }}>
                Envio<span style={{ color: '#FF6200' }}>Plus</span>
            </span>
        </span>
    );
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [tracking, setTracking] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const revealRefs = useRef<HTMLElement[]>([]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.classList.toggle('menu-open', menuOpen);
        return () => document.body.classList.remove('menu-open');
    }, [menuOpen]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        revealRefs.current.forEach((el) => { if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const addRevealRef = (el: HTMLElement | null) => {
        if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
    };

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (tracking.trim()) navigate(`/tracking/${tracking.trim().toUpperCase()}`);
    };

    return (
        <>
            {/* ─── NAVBAR (Dark) ─── */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-inner">
                    <a href="/" className="navbar-logo">
                        <BrandLogo variant="white" size="md" />
                    </a>
                    <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                        <a href="#red" className="navbar-link" onClick={() => setMenuOpen(false)}>Nuestra red</a>
                        <a href="#como-funciona" className="navbar-link" onClick={() => setMenuOpen(false)}>Como funciona</a>
                        <a href="#protocolos" className="navbar-link" onClick={() => setMenuOpen(false)}>Seguridad</a>
                        <a href="#contacto" className="navbar-link" onClick={() => setMenuOpen(false)}>Contacto</a>
                        <a href="/tracking" className="navbar-cta" onClick={() => setMenuOpen(false)}>Rastrear envio</a>
                    </div>
                    <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                        <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
                    </button>
                </div>
            </nav>
            {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />}

            {/* ─── HERO (FedEx-Inspired) ─── */}
            <section className="hero">

                <div className="hero-inner">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Conectados con el mañana.
                        </h1>
                        <p className="hero-subtitle">
                            Infraestructura logística con cobertura nacional, seguimiento en tiempo real
                            y protocolos de entrega verificada.
                        </p>

                        {/* Action Cards - FedEx style */}
                        <div className="hero-action-cards">
                            <a href="/cotizar" className="action-card">
                                {Icons.package}
                                <span>Tarifas y tiempos</span>
                            </a>
                            <a href="/tracking" className="action-card active">
                                {Icons.search}
                                <span>Rastrea</span>
                            </a>
                            <a href="/cotizar" className="action-card">
                                {Icons.truck}
                                <span>Envía</span>
                            </a>
                        </div>

                        {/* White tracking bar */}
                        <div className="hero-tracking">
                            <form className="hero-tracking-form" onSubmit={handleTrack}>
                                <input
                                    className="input-track"
                                    placeholder="ID DE RASTREO"
                                    value={tracking}
                                    onChange={(e) => setTracking(e.target.value)}
                                />
                                <button type="submit" className="btn-track">
                                    TRACK
                                    {Icons.arrowRight}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── METRICS BAR (Institutional Dashboard) ─── */}
            <section className="metrics-bar">
                <div className="metrics-grid">
                    {[
                        { value: '+120,000', label: 'envíos gestionados' },
                        { value: '99.87%', label: 'entregas efectivas' },
                        { value: '24/7', label: 'monitoreo activo' },
                        { value: '12', label: 'centros de cobertura' },
                    ].map((m, i) => (
                        <div className="metric-item" key={i}>
                            <div className="metric-value">{m.value}</div>
                            <div className="metric-label">{m.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── SEGMENTATION (B2B / B2C) ─── */}
            <section className="section segmentation-section" id="soluciones" ref={addRevealRef}>
                <div className="container reveal" ref={addRevealRef}>
                    <div className="segmentation-grid">
                        <div className="segment-block dark">
                            <span className="segment-label">Para negocios</span>
                            <h2 className="segment-title" style={{ color: 'white' }}>Automatiza tu logística</h2>
                            <p className="segment-desc">
                                Integra tu operación con nuestra infraestructura. Guías automáticas,
                                tracking en tiempo real y reportes operativos.
                            </p>
                            <div className="segment-features">
                                {['Multi-sucursal y multi-usuario', 'Generación masiva de guías', 'Dashboard de métricas', 'API de integración'].map((f, i) => (
                                    <div className="segment-feature" key={i}>
                                        {Icons.check}
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="#contacto" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start' }}>
                                Solicitar solucion logistica
                                {Icons.arrowRight}
                            </a>
                        </div>
                        <div className="segment-block">
                            <span className="segment-label">Para clientes</span>
                            <h2 className="segment-title">Rastrea tu envío</h2>
                            <p className="segment-desc">
                                Consulta el estado de tu paquete en cualquier momento. Trazabilidad
                                completa desde la recolección hasta la entrega.
                            </p>
                            <div className="segment-features">
                                {['Tracking en tiempo real', 'Notificaciones de estado', 'Evidencia de entrega', 'Atención por WhatsApp'].map((f, i) => (
                                    <div className="segment-feature" key={i}>
                                        {Icons.check}
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>
                            <a href="/tracking" className="btn btn-secondary btn-lg" style={{ alignSelf: 'flex-start' }}>
                                Rastrear mi envio
                                {Icons.arrowRight}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── VILLAIN (StoryBrand — The Problem) ─── */}
            <section className="section villain-section" ref={addRevealRef}>
                <div className="container">
                    <div className="villain-header reveal" ref={addRevealRef}>
                        <span className="overline">El problema</span>
                        <h2 className="h2">La logística improvisada cuesta dinero y reputación</h2>
                        <p className="lead">
                            Cada paquete perdido, cada retraso sin explicación y cada operación sin trazabilidad
                            erosiona la confianza de tus clientes.
                        </p>
                    </div>
                    <div className="villain-grid reveal" ref={addRevealRef}>
                        {[
                            { icon: Icons.clock, title: 'Retrasos constantes', desc: 'Entregas fuera de tiempo sin visibilidad del problema ni protocolo de respuesta.' },
                            { icon: Icons.xCircle, title: 'Pérdida de paquetes', desc: 'Envíos extraviados sin trazabilidad ni proceso claro de resolución.' },
                            { icon: Icons.alertTriangle, title: 'Sin trazabilidad', desc: 'Tu cliente pregunta "¿dónde está mi paquete?" y no tienes respuesta concreta.' },
                            { icon: Icons.zap, title: 'Operaciones caóticas', desc: 'Procesos manuales, datos dispersos y cero visibilidad sobre tu operación logística.' },
                        ].map((item, i) => (
                            <div className="villain-card" key={i}>
                                <div className="villain-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── NUESTRA RED (Dark Map — Real Mexico SVG) ─── */}
            <section className="section network-section" id="red" ref={addRevealRef}>
                <div className="container network-content">
                    <div className="network-header reveal" ref={addRevealRef}>
                        <span className="overline">Nuestra red</span>
                        <h2 className="h2">Cobertura estratégica en todo México</h2>
                        <p className="lead" style={{ color: 'var(--text-on-dark-muted)' }}>
                            12 centros operativos posicionados estratégicamente para maximizar eficiencia
                            y reducir tiempos de entrega en todo el territorio nacional.
                        </p>
                    </div>

                    {/* Mexico Map Image */}
                    <div className="mexico-map-container reveal" ref={addRevealRef}>
                        <img
                            src="/images/mexico-map.webp"
                            alt="Red logistica EnvioPlus en Mexico"
                            className="mexico-map-img"
                            loading="lazy"
                        />
                    </div>

                    <div className="network-stats-row reveal" ref={addRevealRef}>
                        {[
                            { value: '12', label: 'Centros operativos', icon: Icons.mapPin },
                            { value: '48h', label: 'Entrega promedio', icon: Icons.clock },
                            { value: '+200', label: 'Rutas activas', icon: Icons.truck },
                        ].map((s, i) => (
                            <div className="network-stat" key={i}>
                                <div className="network-stat-icon">{s.icon}</div>
                                <div className="network-stat-value">{s.value}</div>
                                <div className="network-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── NUESTRA FLOTA (Photo Carousel) ─── */}
            <section className="section fleet-section" ref={addRevealRef}>
                <div className="container">
                    <div className="fleet-header reveal" ref={addRevealRef}>
                        <span className="overline">Nuestra flota</span>
                        <h2 className="h2">Flotilla identificada en cada ruta</h2>
                        <p className="lead">
                            Flota propia con rastreo GPS, señalización normativa y protocolos de seguridad activos.
                            Cada unidad es un punto de control en nuestra red.
                        </p>
                    </div>
                </div>

                {/* Auto-scrolling fleet carousel */}
                <div className="fleet-carousel-wrapper reveal" ref={addRevealRef}>
                    <div className="fleet-carousel-track">
                        {[
                            { img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop', type: 'Camioneta de reparto', cap: 'Ultima milla' },
                            { img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop', type: 'Van de carga', cap: 'Distribucion urbana' },
                            { img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop', type: 'Camion de carga', cap: 'Ruta nacional' },
                            { img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&h=400&fit=crop', type: 'Unidad refrigerada', cap: 'Carga especial' },
                            // Duplicates for infinite loop
                            { img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&h=400&fit=crop', type: 'Camioneta de reparto', cap: 'Ultima milla' },
                            { img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop', type: 'Van de carga', cap: 'Distribucion urbana' },
                            { img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop', type: 'Camion de carga', cap: 'Ruta nacional' },
                            { img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600&h=400&fit=crop', type: 'Unidad refrigerada', cap: 'Carga especial' },
                        ].map((v, i) => (
                            <div className="fleet-card" key={i}>
                                <div className="fleet-card-img" style={{ backgroundImage: `url(${v.img})` }}>
                                    <div className="fleet-card-overlay">
                                        <div className="fleet-card-logo">
                                            <BrandLogo variant="white" size="sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="fleet-card-info">
                                    <span className="fleet-card-type">{v.type}</span>
                                    <span className="fleet-card-cap">{v.cap}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container">
                    <div className="fleet-stats-row reveal" ref={addRevealRef}>
                        {[
                            { value: '+45', label: 'Unidades activas' },
                            { value: 'GPS', label: 'Rastreo satelital' },
                            { value: '24/7', label: 'Monitoreo en ruta' },
                            { value: '100%', label: 'Aseguradas' },
                        ].map((s, i) => (
                            <div className="fleet-stat" key={i}>
                                <div className="fleet-stat-value">{s.value}</div>
                                <div className="fleet-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── PLAN CLARO (Implementation Steps) ─── */}
            < section className="section plan-section" id="como-funciona" ref={addRevealRef} >
                <div className="container">
                    <div className="plan-header reveal" ref={addRevealRef}>
                        <span className="overline">Proceso estructural</span>
                        <h2 className="h2">Cómo implementamos tu operación</h2>
                        <p className="lead">
                            Un proceso claro, medible y diseñado para escalar tu logística sin improvisaciones.
                        </p>
                    </div>
                    <div className="plan-steps reveal" ref={addRevealRef}>
                        {[
                            { num: '01', title: 'Diagnóstico logístico', desc: 'Analizamos tu operación actual, volúmenes, rutas y puntos de falla.' },
                            { num: '02', title: 'Integración tecnológica', desc: 'Conectamos tu sistema con nuestra plataforma de tracking y guías automáticas.' },
                            { num: '03', title: 'Operación y monitoreo', desc: 'Tu logística opera con protocolos verificados y monitoreo 24/7 en tiempo real.' },
                            { num: '04', title: 'Optimización continua', desc: 'Reportes mensuales, métricas de desempeño y ajustes operativos constantes.' },
                        ].map((step, i) => (
                            <div className="plan-step" key={i}>
                                <div className="plan-step-number">{step.num}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── PROTOCOLOS DE SEGURIDAD ─── */}
            < section className="section protocols-section" id="protocolos" ref={addRevealRef} >
                <div className="container">
                    <div className="protocols-header reveal" ref={addRevealRef}>
                        <span className="overline">Protocolos de seguridad</span>
                        <h2 className="h2">Cada envío bajo control verificable</h2>
                        <p className="lead">
                            Sistema de protocolos que garantiza trazabilidad y evidencia en cada etapa.
                        </p>
                    </div>
                    <div className="protocols-grid reveal" ref={addRevealRef}>
                        {[
                            { icon: Icons.fingerprint, title: 'Verificación biométrica' },
                            { icon: Icons.document, title: 'Registro digital' },
                            { icon: Icons.camera, title: 'Evidencia fotográfica' },
                            { icon: Icons.edit, title: 'Firma digital' },
                            { icon: Icons.verified, title: 'SLA garantizado' },
                        ].map((p, i) => (
                            <div className="protocol-card" key={i}>
                                <div className="protocol-icon">{p.icon}</div>
                                <h3>{p.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── RIESGO INVERTIDO (Guarantees) ─── */}
            < section className="section guarantee-section" ref={addRevealRef} >
                <div className="container">
                    <div className="guarantee-content">
                        <div className="guarantee-header reveal" ref={addRevealRef}>
                            <span className="overline">Garantía operativa</span>
                            <h2 className="h2">Tu riesgo, invertido</h2>
                            <p className="lead">
                                No prometemos. Garantizamos. Si no cumplimos, respondemos.
                            </p>
                        </div>
                        <div className="guarantee-grid reveal" ref={addRevealRef}>
                            {[
                                { icon: Icons.shield, title: 'SLA garantizado', desc: 'Acuerdo de nivel de servicio con tiempos de entrega comprometidos y medibles.' },
                                { icon: Icons.target, title: 'Compensación por incumplimiento', desc: 'Si fallamos el SLA, compensamos. Así de directo.' },
                                { icon: Icons.verified, title: 'Entregas verificadas', desc: 'Cada entrega con evidencia fotográfica, firma digital y registro trazable.' },
                            ].map((g, i) => (
                                <div className="guarantee-card" key={i}>
                                    <div className="guarantee-icon">{g.icon}</div>
                                    <h3>{g.title}</h3>
                                    <p>{g.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section >

            {/* ─── BENEFITS ─── */}
            < section className="section benefits-section" id="beneficios" ref={addRevealRef} >
                <div className="container">
                    <div className="section-header reveal" ref={addRevealRef} style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--space-10)' }}>
                        <span className="overline">Capacidades operativas</span>
                        <h2 className="h2">Lo que ganas con EnvioPlus</h2>
                        <p className="lead">Resultados reales para tu operación, no features técnicos.</p>
                    </div>
                    <div className="benefits-grid reveal" ref={addRevealRef}>
                        {[
                            { icon: Icons.eye, title: 'Control total', desc: 'Visibilidad completa de cada envío, desde la recolección hasta la entrega final.' },
                            { icon: Icons.shield, title: 'Imagen profesional', desc: 'Guías impresas, tracking público y proceso verificado. Tu cliente confía más.' },
                            { icon: Icons.zap, title: 'Reducción de errores', desc: 'Sistema que valida datos y automatiza la trazabilidad. Menos llamadas, menos problemas.' },
                            { icon: Icons.barChart, title: 'Optimización logística', desc: 'Reportes, métricas y datos para tomar mejores decisiones operativas.' },
                            { icon: Icons.truck, title: 'Operación escalable', desc: 'Multi-sucursal, multi-usuario. Crece sin cambiar de herramienta.' },
                            { icon: Icons.lock, title: 'Seguridad garantizada', desc: 'Datos protegidos, acceso por roles y bitácora completa de cada movimiento.' },
                        ].map((b, i) => (
                            <div className="benefit-card" key={i}>
                                <div className="benefit-icon">{b.icon}</div>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ─── SOCIAL PROOF (Empresas que confían) ─── */}
            < section className="section social-proof-section" ref={addRevealRef} >
                <div className="container">
                    <div className="social-proof-header reveal" ref={addRevealRef}>
                        <span className="overline">Confianza estructural</span>
                        <h2 className="h2">Empresas que confían en nosotros</h2>
                    </div>
                    <div className="clients-grid reveal" ref={addRevealRef}>
                        {[
                            { icon: Icons.shoppingBag, label: 'E-commerce' },
                            { icon: Icons.building, label: 'Corporativos' },
                            { icon: Icons.settings, label: 'Refacciones' },
                            { icon: Icons.package, label: 'Boutiques' },
                            { icon: Icons.document, label: 'Documentos' },
                        ].map((c, i) => (
                            <div className="client-badge" key={i}>
                                {c.icon}
                                <span>{c.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="testimonials reveal" ref={addRevealRef}>
                        {[
                            {
                                text: 'Antes perdíamos 2 de cada 10 envíos porque no sabíamos dónde estaban. Con EnvioPlus, cada paquete tiene trazabilidad completa.',
                                name: 'Roberto M.', role: 'Director de operaciones', initials: 'RM'
                            },
                            {
                                text: 'Nuestros clientes ahora pueden rastrear sus pedidos ellos mismos. Redujo un 70% las llamadas preguntando por estatus.',
                                name: 'Laura G.', role: 'Coordinadora logística', initials: 'LG'
                            },
                            {
                                text: 'La integración fue directa. Guías automáticas, tracking funcional y entrega confirmada. Infraestructura real.',
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
            </section >

            {/* ─── CTA FINAL (Dual) ─── */}
            < section className="section cta-section" ref={addRevealRef} >
                <div className="container">
                    <div className="cta-content reveal" ref={addRevealRef}>
                        <h2 className="h2">¿Listo para estructurar tu logística?</h2>
                        <p className="lead">
                            Deja de improvisar. Implementa la infraestructura logística
                            que tu operación exige.
                        </p>
                        <div className="cta-buttons">
                            <a href="/tracking" className="btn btn-white btn-lg">
                                Rastrear un envio
                            </a>
                            <a href="#contacto" className="btn btn-ghost btn-lg">
                                Solicitar solucion logistica
                            </a>
                        </div>
                    </div>
                </div>
            </section >

            {/* ─── FOOTER ─── */}
            < footer className="footer" id="contacto" >
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <BrandLogo variant="white" size="lg" />
                            </div>
                            <p className="footer-slogan">Infraestructura logística que mueve a México</p>
                            <p className="footer-desc">
                                Control total sobre cada envío con seguimiento en tiempo real.
                                Red operativa diseñada para negocios que exigen resultados.
                            </p>
                            <div className="footer-security">
                                {Icons.shield}
                                <span>Datos protegidos con encriptación SSL</span>
                            </div>
                        </div>
                        <div className="footer-col">
                            <h4>Servicio</h4>
                            <ul className="footer-links">
                                <li><a href="/tracking">Rastrear envío</a></li>
                                <li><a href="#como-funciona">Cómo funciona</a></li>
                                <li><a href="#beneficios">Capacidades</a></li>
                                <li><a href="#red">Cobertura</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Empresa</h4>
                            <ul className="footer-links">
                                <li><a href="#">Sobre nosotros</a></li>
                                <li><a href="#">Política de servicio</a></li>
                                <li><a href="#">Aviso de privacidad</a></li>
                                <li><a href="#">Términos y condiciones</a></li>
                            </ul>
                        </div>
                        <div className="footer-col">
                            <h4>Contacto</h4>
                            <ul className="footer-links">
                                <li><a href="#">contacto@envioplus.com.mx</a></li>
                                <li><a href="#">+52 (XXX) XXX-XXXX</a></li>
                                <li><a href="#">Av. Principal #123, Col. Centro</a></li>
                                <li><a href="#">Ciudad, Estado, México</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <a href="https://admin.envioplus.com.mx" style={{ color: 'inherit', textDecoration: 'none' }} title="Panel de administración">&copy; {new Date().getFullYear()} EnvioPlus. Todos los derechos reservados.</a>
                        <div className="footer-bottom-links">
                            <a href="#">Privacidad</a>
                            <a href="#">Términos</a>
                            <a href="#">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer >
        </>
    );
}
