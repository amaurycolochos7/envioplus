import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const Icons = {
    arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    creditCard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
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
    const [zipLoading, setZipLoading] = useState<{ sender?: boolean; recipient?: boolean }>({});
    const [cityOptions, setCityOptions] = useState<{ sender: string[]; recipient: string[] }>({ sender: [], recipient: [] });
    const [stateOptions, setStateOptions] = useState<{ sender: string[]; recipient: string[] }>({ sender: [], recipient: [] });
    const [manualMode, setManualMode] = useState<{ senderCity?: boolean; senderState?: boolean; recipientCity?: boolean; recipientState?: boolean }>({});

    const [form, setForm] = useState({
        senderName: '', senderPhone: '', senderEmail: '',
        senderStreet: '', senderNumber: '', senderNeighborhood: '',
        senderCity: '', senderState: '', senderZip: '', senderReferences: '',
        recipientName: '', recipientPhone: '', recipientEmail: '',
        recipientStreet: '', recipientNumber: '', recipientNeighborhood: '',
        recipientCity: '', recipientState: '', recipientZip: '', recipientReferences: '',
        packageType: 'PACKAGE', weight: '', length: '', width: '', height: '',
        declaredContent: '', declaredValue: '',
        serviceType: 'STANDARD', insurance: false, insuranceAmount: '',
        pickupRequested: false,
        paymentMethod: 'CASH', subtotal: '', extras: '', totalAmount: '',
        originBranchId: '',
    });

    useEffect(() => {
        api.getBranches().then(setBranches).catch(console.error);
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const lookupZip = async (zip: string, prefix: 'sender' | 'recipient') => {
        if (!zip || zip.length < 5) return;
        setZipLoading((prev) => ({ ...prev, [prefix]: true }));
        setManualMode((prev) => ({ ...prev, [`${prefix}City`]: false, [`${prefix}State`]: false }));
        try {
            const res = await fetch(`https://api.zippopotam.us/MX/${zip}`);
            if (res.ok) {
                const data = await res.json();
                const places = data.places || [];
                if (places.length > 0) {
                    const states = [...new Set(places.map((p: any) => p.state as string))];
                    const cities = [...new Set(places.map((p: any) => p['place name'] as string))];
                    setStateOptions((prev) => ({ ...prev, [prefix]: states }));
                    setCityOptions((prev) => ({ ...prev, [prefix]: cities }));
                    setForm((prev) => ({
                        ...prev,
                        [`${prefix}State`]: states[0] || '',
                        [`${prefix}City`]: cities[0] || '',
                    }));
                }
            } else {
                setCityOptions((prev) => ({ ...prev, [prefix]: [] }));
                setStateOptions((prev) => ({ ...prev, [prefix]: [] }));
            }
        } catch {
            setCityOptions((prev) => ({ ...prev, [prefix]: [] }));
            setStateOptions((prev) => ({ ...prev, [prefix]: [] }));
        }
        finally { setZipLoading((prev) => ({ ...prev, [prefix]: false })); }
    };

    const handleSelectWithOtro = (e: any, field: string, manualKey: string) => {
        const val = e.target.value;
        if (val === '__OTHER__') {
            setManualMode((prev) => ({ ...prev, [manualKey]: true }));
            setForm((prev) => ({ ...prev, [field]: '' }));
        } else {
            setForm((prev) => ({ ...prev, [field]: val }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = {
                senderName: form.senderName, senderPhone: form.senderPhone,
                senderEmail: form.senderEmail || undefined,
                senderAddress: { street: form.senderStreet, number: form.senderNumber, neighborhood: form.senderNeighborhood, city: form.senderCity, state: form.senderState, zip: form.senderZip, references: form.senderReferences || undefined },
                recipientName: form.recipientName, recipientPhone: form.recipientPhone,
                recipientEmail: form.recipientEmail || undefined,
                recipientAddress: { street: form.recipientStreet, number: form.recipientNumber, neighborhood: form.recipientNeighborhood, city: form.recipientCity, state: form.recipientState, zip: form.recipientZip, references: form.recipientReferences || undefined },
                packageType: form.packageType,
                weight: form.weight ? parseFloat(form.weight) : undefined,
                dimensions: form.length ? { length: parseFloat(form.length), width: parseFloat(form.width), height: parseFloat(form.height) } : undefined,
                declaredContent: form.declaredContent || undefined,
                declaredValue: form.declaredValue ? parseFloat(form.declaredValue) : undefined,
                serviceType: form.serviceType,
                insurance: form.insurance,
                insuranceAmount: form.insuranceAmount ? parseFloat(form.insuranceAmount) : undefined,
                pickupRequested: form.pickupRequested,
                paymentMethod: form.paymentMethod,
                subtotal: form.subtotal ? parseFloat(form.subtotal) : 0,
                extras: form.extras ? parseFloat(form.extras) : 0,
                totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : 0,
                originBranchId: form.originBranchId || undefined,
            };
            const result = await api.createShipment(payload);
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
                    <button className="btn btn-sm btn-outline" onClick={() => navigate('/shipments')}>{Icons.arrowLeft}</button>
                    <h1 className="topbar-title">Crear guia</h1>
                </div>
            </div>
            <div className="page-content">
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-body">
                            <div className="form-section-title">{Icons.send} Remitente</div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" name="senderName" value={form.senderName} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Telefono *</label><input className="form-input" name="senderPhone" value={form.senderPhone} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" name="senderEmail" value={form.senderEmail} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ maxWidth: 180 }}><label className="form-label">C.P. *</label><input className="form-input" name="senderZip" value={form.senderZip} onChange={handleChange} onBlur={() => lookupZip(form.senderZip, 'sender')} required placeholder="Ej: 29000" maxLength={5} /></div>
                                <div className="form-group"><label className="form-label">Estado * {zipLoading.sender && <span style={{ fontSize: 11, color: 'var(--info)' }}>buscando...</span>}</label>
                                    {manualMode.senderState || stateOptions.sender.length === 0 ? (
                                        <input className="form-input" name="senderState" value={form.senderState} onChange={handleChange} required placeholder="Escribir estado" />
                                    ) : (
                                        <select className="form-select" value={form.senderState} onChange={(e) => handleSelectWithOtro(e, 'senderState', 'senderState')} required>
                                            {stateOptions.sender.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                            <option value="__OTHER__">— Otro —</option>
                                        </select>
                                    )}
                                </div>
                                <div className="form-group"><label className="form-label">Ciudad *</label>
                                    {manualMode.senderCity || cityOptions.sender.length === 0 ? (
                                        <input className="form-input" name="senderCity" value={form.senderCity} onChange={handleChange} required placeholder="Escribir ciudad" />
                                    ) : (
                                        <select className="form-select" value={form.senderCity} onChange={(e) => handleSelectWithOtro(e, 'senderCity', 'senderCity')} required>
                                            {cityOptions.sender.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                            <option value="__OTHER__">— Otro —</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Colonia *</label><input className="form-input" name="senderNeighborhood" value={form.senderNeighborhood} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Calle *</label><input className="form-input" name="senderStreet" value={form.senderStreet} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">No. Ext *</label><input className="form-input" name="senderNumber" value={form.senderNumber} onChange={handleChange} required /></div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}><label className="form-label">Referencias</label><input className="form-input" name="senderReferences" value={form.senderReferences} onChange={handleChange} placeholder="Ej: Entre calle A y calle B, casa azul" /></div>

                            <div className="form-section-title">{Icons.mapPin} Destinatario</div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" name="recipientName" value={form.recipientName} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Telefono *</label><input className="form-input" name="recipientPhone" value={form.recipientPhone} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" name="recipientEmail" value={form.recipientEmail} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ maxWidth: 180 }}><label className="form-label">C.P. *</label><input className="form-input" name="recipientZip" value={form.recipientZip} onChange={handleChange} onBlur={() => lookupZip(form.recipientZip, 'recipient')} required placeholder="Ej: 29000" maxLength={5} /></div>
                                <div className="form-group"><label className="form-label">Estado * {zipLoading.recipient && <span style={{ fontSize: 11, color: 'var(--info)' }}>buscando...</span>}</label>
                                    {manualMode.recipientState || stateOptions.recipient.length === 0 ? (
                                        <input className="form-input" name="recipientState" value={form.recipientState} onChange={handleChange} required placeholder="Escribir estado" />
                                    ) : (
                                        <select className="form-select" value={form.recipientState} onChange={(e) => handleSelectWithOtro(e, 'recipientState', 'recipientState')} required>
                                            {stateOptions.recipient.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                            <option value="__OTHER__">— Otro —</option>
                                        </select>
                                    )}
                                </div>
                                <div className="form-group"><label className="form-label">Ciudad *</label>
                                    {manualMode.recipientCity || cityOptions.recipient.length === 0 ? (
                                        <input className="form-input" name="recipientCity" value={form.recipientCity} onChange={handleChange} required placeholder="Escribir ciudad" />
                                    ) : (
                                        <select className="form-select" value={form.recipientCity} onChange={(e) => handleSelectWithOtro(e, 'recipientCity', 'recipientCity')} required>
                                            {cityOptions.recipient.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                            <option value="__OTHER__">— Otro —</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Colonia *</label><input className="form-input" name="recipientNeighborhood" value={form.recipientNeighborhood} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">Calle *</label><input className="form-input" name="recipientStreet" value={form.recipientStreet} onChange={handleChange} required /></div>
                                <div className="form-group"><label className="form-label">No. Ext *</label><input className="form-input" name="recipientNumber" value={form.recipientNumber} onChange={handleChange} required /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Referencias</label><input className="form-input" name="recipientReferences" value={form.recipientReferences} onChange={handleChange} /></div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-body">
                            <div className="form-section-title">{Icons.package} Paquete</div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Tipo</label>
                                    <select className="form-select" name="packageType" value={form.packageType} onChange={handleChange}>
                                        <option value="ENVELOPE">Sobre</option><option value="BOX">Caja</option><option value="PACKAGE">Paquete</option><option value="OTHER">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Peso (kg)</label><input className="form-input" type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Largo (cm)</label><input className="form-input" type="number" name="length" value={form.length} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Ancho (cm)</label><input className="form-input" type="number" name="width" value={form.width} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Alto (cm)</label><input className="form-input" type="number" name="height" value={form.height} onChange={handleChange} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Contenido declarado</label><input className="form-input" name="declaredContent" value={form.declaredContent} onChange={handleChange} placeholder="Ej: Documentos, electronicos" /></div>
                                <div className="form-group"><label className="form-label">Valor declarado (MXN)</label><input className="form-input" type="number" name="declaredValue" value={form.declaredValue} onChange={handleChange} /></div>
                            </div>

                            <div className="form-section-title">{Icons.truck} Servicio</div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Tipo de servicio</label>
                                    <select className="form-select" name="serviceType" value={form.serviceType} onChange={handleChange}>
                                        <option value="STANDARD">Estandar</option><option value="EXPRESS">Expres</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Sucursal origen</label>
                                    <select className="form-select" name="originBranchId" value={form.originBranchId} onChange={handleChange}>
                                        <option value="">-- Seleccionar --</option>
                                        {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                                    <input type="checkbox" name="insurance" checked={form.insurance} onChange={handleChange} id="insurance" />
                                    <label htmlFor="insurance" className="form-label" style={{ margin: 0 }}>Seguro</label>
                                </div>
                                {form.insurance && (
                                    <div className="form-group"><label className="form-label">Monto seguro (MXN)</label><input className="form-input" type="number" name="insuranceAmount" value={form.insuranceAmount} onChange={handleChange} /></div>
                                )}
                            </div>

                            <div className="form-section-title">{Icons.creditCard} Cobro</div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Metodo de pago</label>
                                    <select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                                        <option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="CARD">Tarjeta</option><option value="OTHER">Otro</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Subtotal</label><input className="form-input" type="number" name="subtotal" value={form.subtotal} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Extras</label><input className="form-input" type="number" name="extras" value={form.extras} onChange={handleChange} /></div>
                                <div className="form-group"><label className="form-label">Total</label><input className="form-input" type="number" name="totalAmount" value={form.totalAmount} onChange={handleChange} /></div>
                            </div>
                        </div>
                    </div>

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
