import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { loadSender, saveSender } from '../config/company';
import ShipmentFormFields, { EMPTY_SHIPMENT_FORM, formToPayload, type ShipmentForm } from '../components/ShipmentFormFields';

const Icons = {
    arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    printer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    clipboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
    eye: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
};

export default function CreateShipmentPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<any>(null);

    // El remitente arranca precargado con los datos de la empresa
    const [form, setForm] = useState<ShipmentForm>({ ...EMPTY_SHIPMENT_FORM, ...loadSender() });

    useEffect(() => {
        api.getBranches().then(setBranches).catch(console.error);
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await api.createShipment(formToPayload(form));
            // Recordar el remitente usado para precargarlo en la siguiente guia
            saveSender({
                senderName: form.senderName, senderPhone: form.senderPhone, senderEmail: form.senderEmail,
                senderStreet: form.senderStreet, senderNumber: form.senderNumber, senderNeighborhood: form.senderNeighborhood,
                senderCity: form.senderCity, senderState: form.senderState, senderZip: form.senderZip,
                senderReferences: form.senderReferences,
            });
            setSuccess(result);
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    if (success) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Guia creada</h1></div></div>
                <div className="page-content">
                    <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
                        <div className="card-body" style={{ padding: 'var(--space-8)' }}>
                            <div style={{ width: 64, height: 64, margin: '0 auto var(--space-5)', borderRadius: 'var(--radius-full)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                {Icons.check}
                            </div>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 8 }}>Guia creada exitosamente</h2>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', margin: '16px 0', letterSpacing: 0.5 }}>{success.trackingNumber}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                                <button className="btn btn-primary" onClick={() => window.open(api.getPdfUrl(success.id), '_blank')}>
                                    {Icons.printer} Imprimir etiqueta
                                </button>
                                <button className="btn btn-outline" onClick={() => { const base = import.meta.env.VITE_PUBLIC_URL || window.location.origin; navigator.clipboard.writeText(`${base}/tracking/${success.trackingNumber}`); toast('Link de tracking copiado'); }}>
                                    {Icons.clipboard} Copiar link de tracking
                                </button>
                                <button className="btn btn-outline" onClick={() => navigate(`/shipments/${success.id}`)}>
                                    {Icons.eye} Ver detalle
                                </button>
                                <button className="btn btn-primary" onClick={() => { setSuccess(null); window.location.reload(); }}>
                                    {Icons.plus} Crear otra guia
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="topbar">
                <div className="topbar-left" style={{ gap: 12 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate('/shipments')} aria-label="Volver a envios">{Icons.arrowLeft}</button>
                    <h1 className="topbar-title">Crear guia</h1>
                </div>
            </div>
            <div className="page-content">
                {error && <div className="alert alert-error" role="alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <ShipmentFormFields form={form} setForm={setForm} branches={branches} mode="create" onToast={toast} />

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/shipments')}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear guia'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
