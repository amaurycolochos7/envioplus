import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PackageIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const ShieldIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.login(email, password);
            localStorage.setItem('ep_token', res.token);
            localStorage.setItem('ep_user', JSON.stringify(res.user));
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-brand">
                <div className="login-brand-content">
                    <div className="login-brand-logo">
                        <svg viewBox="0 0 48 48" fill="none" style={{ width: 44, height: 44 }}>
                            <path d="M24 4L6 14v20l18 10 18-10V14L24 4z" fill="#0E7490" opacity="0.15" />
                            <path d="M24 4L6 14l18 10 18-10L24 4z" fill="#0E7490" opacity="0.3" />
                            <path d="M24 24v20l18-10V14L24 24z" fill="#0E7490" opacity="0.6" />
                            <path d="M24 24v20L6 34V14l18 10z" fill="#0E7490" />
                            <path d="M16 21l6-5 6 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M22 16l4 0 0 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
                            <rect x="35" y="2" width="11" height="11" rx="3" fill="#0E7490" />
                            <line x1="40.5" y1="4.5" x2="40.5" y2="10.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <line x1="37.5" y1="7.5" x2="43.5" y2="7.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
                            Envio<span style={{ color: '#0E7490' }}>Plus</span>
                        </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(14, 116, 144, 0.9)', fontWeight: 600, letterSpacing: '0.04em', marginTop: -4 }}>INFRAESTRUCTURA LOGÍSTICA</p>
                    <h2>Panel de control para tu operacion logistica</h2>
                    <p>
                        Gestiona envios, genera guias, monitorea entregas y administra
                        tu equipo desde un solo lugar.
                    </p>
                </div>
            </div>

            <div className="login-form-section">
                <div className="login-form-container">
                    <h1 className="login-form-title">Iniciar sesion</h1>
                    <p className="login-form-subtitle">Ingresa tus credenciales para acceder al panel</p>

                    {error && (
                        <div className="alert alert-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Correo electronico</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Contrasena</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Ingresa tu contrasena"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--muted-text)', display: 'flex', alignItems: 'center' }}
                                    tabIndex={-1}
                                    title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" /><path d="M14.12 14.12a3 3 0 11-4.24-4.24" /></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <div className="login-security">
                        {ShieldIcon}
                        <span>Conexion segura con encriptacion SSL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
