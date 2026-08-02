import { useState, useEffect } from 'react';
import { api, getStoredUser } from '../services/api';
import { useToast } from '../components/Toast';

const Icons = {
    bank: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><line x1="3" y1="21" x2="21" y2="21" /><line x1="5" y1="21" x2="5" y2="10" /><line x1="19" y1="21" x2="19" y2="10" /><line x1="10" y1="21" x2="10" y2="10" /><line x1="14" y1="21" x2="14" y2="10" /><polygon points="12 2 21 8 3 8 12 2" /></svg>,
    trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
};

const EMPTY = { bankName: '', accountHolder: '', clabe: '', cardNumber: '', accountNumber: '', instructions: '' };

/* Solo digitos, con espacios permitidos mientras se escribe */
const onlyDigits = (v: string) => v.replace(/[^\d\s-]/g, '');
const clean = (v: string) => v.replace(/[\s-]/g, '');

export default function BankAccountPage() {
    const { toast } = useToast();
    const user = getStoredUser();
    const isAdmin = user?.role === 'ADMIN';

    const [form, setForm] = useState({ ...EMPTY });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [configured, setConfigured] = useState(false);

    const load = () => {
        setLoading(true);
        api.getBankAccount()
            .then((acc: any) => {
                if (acc) {
                    setConfigured(true);
                    setForm({
                        bankName: acc.bankName || '',
                        accountHolder: acc.accountHolder || '',
                        clabe: acc.clabe || '',
                        cardNumber: acc.cardNumber || '',
                        accountNumber: acc.accountNumber || '',
                        instructions: acc.instructions || '',
                    });
                } else {
                    setConfigured(false);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (isAdmin) load(); else setLoading(false); }, []);

    const validate = () => {
        if (form.bankName.trim().length < 2) return 'Escribe el nombre del banco.';
        if (form.accountHolder.trim().length < 2) return 'Escribe el nombre del beneficiario.';
        const clabe = clean(form.clabe);
        const card = clean(form.cardNumber);
        const account = clean(form.accountNumber);
        if (!clabe && !card && !account) return 'Registra al menos CLABE, tarjeta o numero de cuenta.';
        if (clabe && !/^\d{18}$/.test(clabe)) return 'La CLABE debe tener exactamente 18 digitos.';
        if (card && !/^\d{15,19}$/.test(card)) return 'La tarjeta debe tener entre 15 y 19 digitos.';
        if (account && !/^\d{6,20}$/.test(account)) return 'La cuenta debe tener entre 6 y 20 digitos.';
        return '';
    };

    const handleSave = async (e: any) => {
        e.preventDefault();
        const msg = validate();
        setError(msg);
        if (msg) return;

        setSaving(true);
        try {
            await api.saveBankAccount({
                bankName: form.bankName.trim(),
                accountHolder: form.accountHolder.trim(),
                clabe: clean(form.clabe),
                cardNumber: clean(form.cardNumber),
                accountNumber: clean(form.accountNumber),
                instructions: form.instructions.trim(),
            });
            toast('Datos bancarios guardados');
            setConfigured(true);
            load();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Desactivar los datos bancarios? El rastreo publico dejara de mostrar el boton de pago.')) return;
        try {
            await api.deleteBankAccount();
            setForm({ ...EMPTY });
            setConfigured(false);
            toast('Datos bancarios desactivados');
        } catch (err: any) { setError(err.message); }
    };

    if (!isAdmin) {
        return (
            <>
                <div className="topbar"><div className="topbar-left"><h1 className="topbar-title">Datos bancarios</h1></div></div>
                <div className="page-content">
                    <div className="alert alert-error" role="alert">Solo un administrador puede consultar o modificar los datos bancarios.</div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="topbar">
                <div className="topbar-left"><h1 className="topbar-title">Datos bancarios</h1></div>
                {configured && (
                    <div className="topbar-right">
                        <button className="btn btn-sm btn-danger" onClick={handleDelete}>{Icons.trash} Desactivar</button>
                    </div>
                )}
            </div>
            <div className="page-content">
                {loading ? (
                    <div className="card card-body" style={{ textAlign: 'center', padding: 60, color: 'var(--muted-text)' }}>Cargando configuracion...</div>
                ) : (
                    <form onSubmit={handleSave}>
                        {error && <div className="alert alert-error" role="alert">{error}</div>}
                        {!configured && !error && (
                            <div className="alert alert-info" role="status">
                                Aun no hay datos bancarios configurados. Mientras no los registres, el rastreo publico no mostrara el boton para transferir.
                            </div>
                        )}

                        <div className="card" style={{ marginBottom: 20, maxWidth: 760 }}>
                            <div className="card-body">
                                <div className="form-section-title">{Icons.bank} Cuenta para transferencias</div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="bankName">Banco *</label>
                                        <input className="form-input" id="bankName" value={form.bankName} maxLength={60}
                                            onChange={(e) => setForm({ ...form, bankName: e.target.value })} required placeholder="Ej: BBVA" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="accountHolder">Beneficiario / titular *</label>
                                        <input className="form-input" id="accountHolder" value={form.accountHolder} maxLength={80}
                                            onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} required placeholder="Nombre como aparece en la cuenta" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="clabe">CLABE interbancaria</label>
                                        <input className="form-input" id="clabe" value={form.clabe} inputMode="numeric" maxLength={24}
                                            onChange={(e) => setForm({ ...form, clabe: onlyDigits(e.target.value) })}
                                            placeholder="18 digitos" aria-describedby="clabeHelp" />
                                        <span id="clabeHelp" className="text-muted text-sm">{clean(form.clabe).length}/18 digitos</span>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="cardNumber">Numero de tarjeta</label>
                                        <input className="form-input" id="cardNumber" value={form.cardNumber} inputMode="numeric" maxLength={24}
                                            onChange={(e) => setForm({ ...form, cardNumber: onlyDigits(e.target.value) })}
                                            placeholder="15 a 19 digitos" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="accountNumber">Numero de cuenta</label>
                                        <input className="form-input" id="accountNumber" value={form.accountNumber} inputMode="numeric" maxLength={24}
                                            onChange={(e) => setForm({ ...form, accountNumber: onlyDigits(e.target.value) })}
                                            placeholder="6 a 20 digitos" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="instructions">Instrucciones o referencia adicional</label>
                                    <textarea className="form-textarea" id="instructions" value={form.instructions} maxLength={300}
                                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                                        placeholder="Ej: Envia tu comprobante por WhatsApp indicando tu numero de guia." />
                                    <span className="text-muted text-sm">{form.instructions.length}/300</span>
                                </div>

                                <p className="text-muted text-sm" style={{ marginTop: 8 }}>
                                    Se mantiene una sola configuracion activa. Estos datos se muestran al cliente solo cuando su guia esta pendiente de pago.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, maxWidth: 760, justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                                {saving ? 'Guardando...' : configured ? 'Guardar cambios' : 'Guardar datos bancarios'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
