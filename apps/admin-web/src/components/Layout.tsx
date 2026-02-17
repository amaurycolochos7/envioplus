import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function getStoredUser() {
    try {
        const raw = localStorage.getItem('ep_user');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

/* ─── SVG Icons ─── */
const I = {
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    plusCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    scan: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
    printer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    barChart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
    logOut: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
};

const NAV_ITEMS = [
    { section: 'Principal' },
    { to: '/dashboard', icon: I.grid, label: 'Dashboard' },
    { to: '/shipments', icon: I.truck, label: 'Envios' },
    { to: '/shipments/new', icon: I.plusCircle, label: 'Crear guia' },
    { to: '/scan', icon: I.scan, label: 'Escaneo rapido' },
    { section: 'Configuracion' },
    { to: '/branches', icon: I.mapPin, label: 'Sucursales' },
    { to: '/users', icon: I.users, label: 'Usuarios' },
    { to: '/print-templates', icon: I.printer, label: 'Plantillas' },
    { to: '/reports', icon: I.barChart, label: 'Reportes' },
];

export default function Layout() {
    const navigate = useNavigate();
    const user = getStoredUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = () => {
        localStorage.removeItem('ep_token');
        localStorage.removeItem('ep_user');
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <div className="app-layout">
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-icon">{I.package}</div>
                    <span className="sidebar-logo-text">EnvioPlus</span>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item, i) =>
                        'section' in item ? (
                            <div className="sidebar-section-label" key={i}>{item.section}</div>
                        ) : (
                            <NavLink
                                key={i}
                                to={item.to!}
                                end={item.to === '/'}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        )
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name || 'Usuario'}</div>
                            <div className="sidebar-user-role">{user?.role || 'Operador'}</div>
                        </div>
                    </div>
                    <button className="sidebar-logout" onClick={logout}>
                        {I.logOut}
                        <span>Cerrar sesion</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <button
                    className="mobile-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {I.menu}
                </button>
                <Outlet />
            </main>
        </div>
    );
}
