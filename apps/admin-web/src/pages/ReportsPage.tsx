export default function ReportsPage() {
    return (
        <>
            <div className="topbar">
                <div className="topbar-left"><h1 className="topbar-title">Reportes</h1></div>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="20" x2="12" y2="10" />
                                <line x1="18" y1="20" x2="18" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="16" />
                            </svg>
                        </div>
                        <div className="empty-state-text">Reportes en desarrollo</div>
                        <div className="empty-state-desc">
                            El modulo de reportes estara disponible en la proxima version.
                            Incluye exportacion a Excel, resumen de entregas, y analisis de rendimiento.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
