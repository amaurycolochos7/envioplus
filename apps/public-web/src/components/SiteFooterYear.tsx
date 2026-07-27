// Año de fundación de la empresa. Se muestra igual en todas las páginas.
export const FOUNDING_YEAR = 2008;

const shieldIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

/* Píldora "Desde 2008" */
export function FoundingBadge() {
    return (
        <div className="footer-badge-year">
            <strong>Desde {FOUNDING_YEAR}</strong>
        </div>
    );
}

/* Pie compacto para las páginas internas (tracking, cotizar) */
export function SiteFooterYear() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-bottom" style={{ paddingTop: 0, borderTop: 'none' }}>
                    <span>&copy; {FOUNDING_YEAR} EnvioPlus. Todos los derechos reservados.</span>
                    <div className="footer-year-side">
                        <FoundingBadge />
                        <div className="footer-security">
                            {shieldIcon}
                            <span>Datos protegidos con encriptación SSL</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
