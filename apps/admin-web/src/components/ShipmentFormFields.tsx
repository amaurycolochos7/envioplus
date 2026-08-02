import { useState } from 'react';
import { DEFAULT_SENDER, clearSender, type SenderData } from '../config/company';

/* Formulario plano compartido por "Crear guia" y "Editar guia".
   Se mantiene plano (sin objetos anidados) porque los inputs trabajan con
   strings; la conversion al payload de la API vive en formToPayload(). */
export type ShipmentForm = {
    senderName: string; senderPhone: string; senderEmail: string;
    senderStreet: string; senderNumber: string; senderNeighborhood: string;
    senderCity: string; senderState: string; senderZip: string; senderReferences: string;
    recipientName: string; recipientPhone: string; recipientEmail: string;
    recipientStreet: string; recipientNumber: string; recipientNeighborhood: string;
    recipientCity: string; recipientState: string; recipientZip: string; recipientReferences: string;
    packageType: string; weight: string; length: string; width: string; height: string;
    declaredContent: string; declaredValue: string;
    serviceType: string; insurance: boolean; insuranceAmount: string;
    pickupRequested: boolean;
    paymentMethod: string; subtotal: string; extras: string; totalAmount: string;
    paid: boolean;
    originBranchId: string;
    destinationBranchId: string;
};

export const EMPTY_SHIPMENT_FORM: ShipmentForm = {
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
    paid: false,
    originBranchId: '',
    destinationBranchId: '',
};

const str = (v: any) => (v === null || v === undefined ? '' : String(v));

/* Guia de la API -> formulario plano */
export function formFromShipment(s: any): ShipmentForm {
    const sa = s.senderAddress || {};
    const ra = s.recipientAddress || {};
    const d = s.dimensions || {};
    return {
        senderName: str(s.senderName), senderPhone: str(s.senderPhone), senderEmail: str(s.senderEmail),
        senderStreet: str(sa.street), senderNumber: str(sa.number), senderNeighborhood: str(sa.neighborhood),
        senderCity: str(sa.city), senderState: str(sa.state), senderZip: str(sa.zip), senderReferences: str(sa.references),
        recipientName: str(s.recipientName), recipientPhone: str(s.recipientPhone), recipientEmail: str(s.recipientEmail),
        recipientStreet: str(ra.street), recipientNumber: str(ra.number), recipientNeighborhood: str(ra.neighborhood),
        recipientCity: str(ra.city), recipientState: str(ra.state), recipientZip: str(ra.zip), recipientReferences: str(ra.references),
        packageType: str(s.packageType) || 'PACKAGE',
        weight: str(s.weight), length: str(d.length), width: str(d.width), height: str(d.height),
        declaredContent: str(s.declaredContent), declaredValue: str(s.declaredValue),
        serviceType: str(s.serviceType) || 'STANDARD',
        insurance: !!s.insurance, insuranceAmount: str(s.insuranceAmount),
        pickupRequested: !!s.pickupRequested,
        paymentMethod: str(s.paymentMethod) || 'CASH',
        subtotal: str(s.subtotal), extras: str(s.extras), totalAmount: str(s.totalAmount),
        paid: !!s.paid,
        originBranchId: str(s.originBranchId),
        destinationBranchId: str(s.destinationBranchId),
    };
}

const num = (v: string) => (v !== '' && !isNaN(parseFloat(v)) ? parseFloat(v) : undefined);

/* Formulario plano -> payload de la API (mismo contrato para crear y editar) */
export function formToPayload(form: ShipmentForm) {
    return {
        senderName: form.senderName, senderPhone: form.senderPhone,
        senderEmail: form.senderEmail || undefined,
        senderAddress: {
            street: form.senderStreet, number: form.senderNumber, neighborhood: form.senderNeighborhood,
            city: form.senderCity, state: form.senderState, zip: form.senderZip,
            references: form.senderReferences || undefined,
        },
        recipientName: form.recipientName, recipientPhone: form.recipientPhone,
        recipientEmail: form.recipientEmail || undefined,
        recipientAddress: {
            street: form.recipientStreet, number: form.recipientNumber, neighborhood: form.recipientNeighborhood,
            city: form.recipientCity, state: form.recipientState, zip: form.recipientZip,
            references: form.recipientReferences || undefined,
        },
        packageType: form.packageType,
        weight: num(form.weight),
        dimensions: form.length ? { length: num(form.length)!, width: num(form.width)!, height: num(form.height)! } : undefined,
        declaredContent: form.declaredContent || undefined,
        declaredValue: num(form.declaredValue),
        serviceType: form.serviceType,
        insurance: form.insurance,
        insuranceAmount: form.insurance ? num(form.insuranceAmount) : undefined,
        pickupRequested: form.pickupRequested,
        paymentMethod: form.paymentMethod,
        subtotal: num(form.subtotal) ?? 0,
        extras: num(form.extras) ?? 0,
        totalAmount: num(form.totalAmount) ?? 0,
        paid: form.paid,
        originBranchId: form.originBranchId || undefined,
        destinationBranchId: form.destinationBranchId || undefined,
    };
}

const Icons = {
    send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    creditCard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
};

type Props = {
    form: ShipmentForm;
    setForm: React.Dispatch<React.SetStateAction<ShipmentForm>>;
    branches: any[];
    /* En "crear" se ofrecen los atajos del remitente por defecto */
    mode?: 'create' | 'edit';
    onToast?: (msg: string) => void;
};

export default function ShipmentFormFields({ form, setForm, branches, mode = 'create', onToast }: Props) {
    const [zipLoading, setZipLoading] = useState<{ sender?: boolean; recipient?: boolean }>({});
    const [cityOptions, setCityOptions] = useState<{ sender: string[]; recipient: string[] }>({ sender: [], recipient: [] });
    const [stateOptions, setStateOptions] = useState<{ sender: string[]; recipient: string[] }>({ sender: [], recipient: [] });
    const [manualMode, setManualMode] = useState<Record<string, boolean>>({});

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
                    const states = [...new Set(places.map((p: any) => p.state as string))] as string[];
                    const cities = [...new Set(places.map((p: any) => p['place name'] as string))] as string[];
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
        } finally {
            setZipLoading((prev) => ({ ...prev, [prefix]: false }));
        }
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

    const applySender = (sender: SenderData) => {
        setManualMode((prev) => ({ ...prev, senderCity: false, senderState: false }));
        setCityOptions((prev) => ({ ...prev, sender: [] }));
        setStateOptions((prev) => ({ ...prev, sender: [] }));
        setForm((prev) => ({ ...prev, ...sender }));
    };

    const restoreDefaultSender = () => {
        clearSender();
        applySender(DEFAULT_SENDER);
        onToast?.('Remitente restablecido a los datos de la empresa');
    };

    const emptySender = () => {
        applySender(Object.fromEntries(Object.keys(DEFAULT_SENDER).map((k) => [k, ''])) as SenderData);
    };

    /* Bloque de direccion reutilizado por remitente y destinatario */
    const addressBlock = (prefix: 'sender' | 'recipient') => (
        <>
            <div className="form-row">
                <div className="form-group" style={{ maxWidth: 180 }}>
                    <label className="form-label" htmlFor={`${prefix}Zip`}>C.P. *</label>
                    <input
                        className="form-input" id={`${prefix}Zip`} name={`${prefix}Zip`}
                        value={(form as any)[`${prefix}Zip`]} onChange={handleChange}
                        onBlur={() => lookupZip((form as any)[`${prefix}Zip`], prefix)}
                        required placeholder="Ej: 29000" maxLength={5}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor={`${prefix}State`}>
                        Estado * {zipLoading[prefix] && <span style={{ fontSize: 11, color: 'var(--info)' }}>buscando...</span>}
                    </label>
                    {manualMode[`${prefix}State`] || stateOptions[prefix].length === 0 ? (
                        <input className="form-input" id={`${prefix}State`} name={`${prefix}State`} value={(form as any)[`${prefix}State`]} onChange={handleChange} required placeholder="Escribir estado" />
                    ) : (
                        <select className="form-select" id={`${prefix}State`} value={(form as any)[`${prefix}State`]} onChange={(e) => handleSelectWithOtro(e, `${prefix}State`, `${prefix}State`)} required>
                            {stateOptions[prefix].map((s, i) => <option key={i} value={s}>{s}</option>)}
                            <option value="__OTHER__">— Otro —</option>
                        </select>
                    )}
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor={`${prefix}City`}>Ciudad *</label>
                    {manualMode[`${prefix}City`] || cityOptions[prefix].length === 0 ? (
                        <input className="form-input" id={`${prefix}City`} name={`${prefix}City`} value={(form as any)[`${prefix}City`]} onChange={handleChange} required placeholder="Escribir ciudad" />
                    ) : (
                        <select className="form-select" id={`${prefix}City`} value={(form as any)[`${prefix}City`]} onChange={(e) => handleSelectWithOtro(e, `${prefix}City`, `${prefix}City`)} required>
                            {cityOptions[prefix].map((c, i) => <option key={i} value={c}>{c}</option>)}
                            <option value="__OTHER__">— Otro —</option>
                        </select>
                    )}
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label" htmlFor={`${prefix}Neighborhood`}>Colonia *</label>
                    <input className="form-input" id={`${prefix}Neighborhood`} name={`${prefix}Neighborhood`} value={(form as any)[`${prefix}Neighborhood`]} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor={`${prefix}Street`}>Calle *</label>
                    <input className="form-input" id={`${prefix}Street`} name={`${prefix}Street`} value={(form as any)[`${prefix}Street`]} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label className="form-label" htmlFor={`${prefix}Number`}>No. Ext *</label>
                    <input className="form-input" id={`${prefix}Number`} name={`${prefix}Number`} value={(form as any)[`${prefix}Number`]} onChange={handleChange} required />
                </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                <label className="form-label" htmlFor={`${prefix}References`}>Referencias</label>
                <input className="form-input" id={`${prefix}References`} name={`${prefix}References`} value={(form as any)[`${prefix}References`]} onChange={handleChange} placeholder="Ej: Entre calle A y calle B, casa azul" />
            </div>
        </>
    );

    return (
        <>
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                    <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icons.send} Remitente</span>
                        {mode === 'create' && (
                            <span style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="btn btn-sm btn-outline" onClick={restoreDefaultSender}>Restablecer empresa</button>
                                <button type="button" className="btn btn-sm btn-outline" onClick={emptySender}>Limpiar</button>
                            </span>
                        )}
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="senderName">Nombre *</label><input className="form-input" id="senderName" name="senderName" value={form.senderName} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label" htmlFor="senderPhone">Telefono *</label><input className="form-input" id="senderPhone" name="senderPhone" value={form.senderPhone} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label" htmlFor="senderEmail">Email</label><input className="form-input" id="senderEmail" type="email" name="senderEmail" value={form.senderEmail} onChange={handleChange} /></div>
                    </div>
                    {addressBlock('sender')}

                    <div className="form-section-title">{Icons.mapPin} Destinatario</div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="recipientName">Nombre *</label><input className="form-input" id="recipientName" name="recipientName" value={form.recipientName} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label" htmlFor="recipientPhone">Telefono *</label><input className="form-input" id="recipientPhone" name="recipientPhone" value={form.recipientPhone} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label" htmlFor="recipientEmail">Email</label><input className="form-input" id="recipientEmail" type="email" name="recipientEmail" value={form.recipientEmail} onChange={handleChange} /></div>
                    </div>
                    {addressBlock('recipient')}
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-body">
                    <div className="form-section-title">{Icons.package} Paquete</div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="packageType">Tipo</label>
                            <select className="form-select" id="packageType" name="packageType" value={form.packageType} onChange={handleChange}>
                                <option value="ENVELOPE">Sobre</option><option value="BOX">Caja</option><option value="PACKAGE">Paquete</option><option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label" htmlFor="weight">Peso (kg)</label><input className="form-input" id="weight" type="number" step="0.1" min="0" name="weight" value={form.weight} onChange={handleChange} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="length">Largo (cm)</label><input className="form-input" id="length" type="number" min="0" name="length" value={form.length} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label" htmlFor="width">Ancho (cm)</label><input className="form-input" id="width" type="number" min="0" name="width" value={form.width} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label" htmlFor="height">Alto (cm)</label><input className="form-input" id="height" type="number" min="0" name="height" value={form.height} onChange={handleChange} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="declaredContent">Contenido declarado</label><input className="form-input" id="declaredContent" name="declaredContent" value={form.declaredContent} onChange={handleChange} placeholder="Ej: Documentos, electronicos" /></div>
                        <div className="form-group"><label className="form-label" htmlFor="declaredValue">Valor declarado (MXN)</label><input className="form-input" id="declaredValue" type="number" min="0" name="declaredValue" value={form.declaredValue} onChange={handleChange} /></div>
                    </div>

                    <div className="form-section-title">{Icons.truck} Servicio</div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="serviceType">Tipo de servicio</label>
                            <select className="form-select" id="serviceType" name="serviceType" value={form.serviceType} onChange={handleChange}>
                                <option value="STANDARD">Estandar</option><option value="EXPRESS">Expres</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label" htmlFor="originBranchId">Sucursal origen</label>
                            <select className="form-select" id="originBranchId" name="originBranchId" value={form.originBranchId} onChange={handleChange}>
                                <option value="">-- Seleccionar --</option>
                                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label" htmlFor="destinationBranchId">Sucursal destino</label>
                            <select className="form-select" id="destinationBranchId" name="destinationBranchId" value={form.destinationBranchId} onChange={handleChange}>
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
                            <div className="form-group"><label className="form-label" htmlFor="insuranceAmount">Monto seguro (MXN)</label><input className="form-input" id="insuranceAmount" type="number" min="0" name="insuranceAmount" value={form.insuranceAmount} onChange={handleChange} /></div>
                        )}
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                            <input type="checkbox" name="pickupRequested" checked={form.pickupRequested} onChange={handleChange} id="pickupRequested" />
                            <label htmlFor="pickupRequested" className="form-label" style={{ margin: 0 }}>Recoleccion a domicilio</label>
                        </div>
                    </div>

                    <div className="form-section-title">{Icons.creditCard} Cobro</div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label" htmlFor="paymentMethod">Metodo de pago</label>
                            <select className="form-select" id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                                <option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="CARD">Tarjeta</option><option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div className="form-group"><label className="form-label" htmlFor="subtotal">Precio del envio</label><input className="form-input" id="subtotal" type="number" min="0" step="0.01" name="subtotal" value={form.subtotal} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label" htmlFor="extras">Cargos adicionales</label><input className="form-input" id="extras" type="number" min="0" step="0.01" name="extras" value={form.extras} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label" htmlFor="totalAmount">Total</label><input className="form-input" id="totalAmount" type="number" min="0" step="0.01" name="totalAmount" value={form.totalAmount} onChange={handleChange} /></div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <input type="checkbox" name="paid" checked={form.paid} onChange={handleChange} id="paid" />
                        <label htmlFor="paid" className="form-label" style={{ margin: 0 }}>
                            Pago recibido <span style={{ color: 'var(--muted-text)', fontWeight: 400 }}>— si no se marca, el rastreo publico mostrara NO PAGADO</span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}
