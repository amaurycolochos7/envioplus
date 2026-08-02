import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getStoredUser } from '../services/api';
import { useToast } from '../components/Toast';
import ShipmentFormFields, { EMPTY_SHIPMENT_FORM, formFromShipment, formToPayload, type ShipmentForm } from '../components/ShipmentFormFields';

const STATUS_LABELS: Record<string, string> = {
    CREATED: 'Creado', PICKED_UP: 'Recolectado', RECEIVED_AT_ORIGIN: 'Recibido en origen',
    IN_TRANSIT: 'En transito', AT_DESTINATION_BRANCH: 'En sucursal destino',
    OUT_FOR_DELIVERY: 'En reparto', DELIVERED: 'Entregado',
    INCIDENCE: 'Incidencia', CANCELLED: 'Cancelado',
};

const Icons = {
    arrowLeft: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    tag: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
};

export default function EditShipmentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const user = getStoredUser();
    const canEdit = ['ADMIN', 'SUPERVISOR'].includes(user?.role);

    const [form, setForm] = useState<ShipmentForm>(EMPTY_SHIPMENT_FORM);
    const [branches, setBranches] = useState<any[]>([]);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [originalTracking, setOriginalTracking] = useState('');
    const [status, setStatus] = useState('CREATED');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        Promise.all([api.getShipment(id!), api.getBranches().catch(() => [])])
            .then(([shipment, branchList]) => {
                if (!alive) return;
                setForm(formFromShipment(shipment));
                setTrackingNumber(shipment.trackingNumber || '');
                setOriginalTracking(shipment.trackingNumber || '');
                setStatus(shipment.currentStatus || shipment.status || 'CREATED');
                setBranches(branchList as any[]);
            })
            .catch(() => { if (alive) setNotFound(true); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [id]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');

        const tracking = trackingNumber.trim().toUpperCase();
        if (!/^[A-Z0-9-]{6,30}$/.test(tracking)) {
            setError('El numero de guia debe tener entre 6 y 30 caracteres (letras, numeros o guiones).');
            return;
        }

        setSaving(true);
        try {
            // En edicion, un campo vaciado debe borrarse (null), no omitirse
            const base = formToPayload(form);
            const payload: any = {
                ...base,
                currentStatus: status,
                senderEmail: base.senderEmail ?? null,
                recipientEmail: base.recipientEmail ?? null,
                weight: base.weight ?? null,
                dimensions: base.dimensions ?? null,
                declaredContent: base.declaredContent ?? null,
                declaredValue: base.declaredValue ?? null,
                insuranceAmount: base.insuranceAmount ?? null,
                originBranchId: base.originBranchId ?? null,
                destinationBranchId: base.destinationBranchId ?? null,
            };
            // Solo se manda el numero de guia si realmente cambio
            if (tracking !== originalTracking) payload.trackingNumber = tracking;

            const updated = await api.updateShipment(id!, payload);
            toast('Guia actualizada correctamente');
            navigate(`/shipments/${updated.id || id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!canEdit) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Editar guia</h1></div></div>
                <div className="page-content">
                    <div className="alert alert-error" role="alert">No tienes permisos para editar guias. Solicita acceso de administrador o supervisor.</div>
                    <button className="btn btn-outline" onClick={() => navigate(`/shipments/${id}`)}>Volver al detalle</button>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Editar guia</h1></div></div>
                <div className="page-content">
                    <div className="card card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--muted-text)' }}>Cargando datos de la guia...</div>
                </div>
            </>
        );
    }

    if (notFound) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Editar guia</h1></div></div>
                <div className="page-content">
                    <div className="alert alert-error" role="alert">No se encontro la guia solicitada.</div>
                    <button className="btn btn-outline" onClick={() => navigate('/shipments')}>Volver a envios</button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="topbar">
                <div className="topbar-left" style={{ gap: 12 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/shipments/${id}`)} aria-label="Volver al detalle">{Icons.arrowLeft}</button>
                    <h1 className="topbar-title">Editar guia {originalTracking}</h1>
                </div>
            </div>
            <div className="page-content">
                {error && <div className="alert alert-error" role="alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-body">
                            <div className="form-section-title">{Icons.tag} Identificacion y estado</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="trackingNumber">Numero de guia *</label>
                                    <input
                                        className="form-input" id="trackingNumber" value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                                        required minLength={6} maxLength={30}
                                        aria-describedby="trackingHelp"
                                    />
                                    <span id="trackingHelp" className="text-muted text-sm" style={{ display: 'block', marginTop: 6 }}>
                                        Si lo cambias, el rastreo publico funcionara con el numero nuevo.
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="currentStatus">Estado del envio</label>
                                    <select className="form-select" id="currentStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
                                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ShipmentFormFields form={form} setForm={setForm} branches={branches} mode="edit" onToast={toast} />

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate(`/shipments/${id}`)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
