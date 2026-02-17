import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Icons = {
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
    mapPin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
};

export default function BranchesPage() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', address: '', phone: '' });

    const load = () => {
        setLoading(true);
        api.getBranches().then(setBranches).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm({ name: '', address: '', phone: '' }); setShowModal(true); };
    const openEdit = (b: any) => { setEditing(b); setForm({ name: b.name, address: b.address || '', phone: b.phone || '' }); setShowModal(true); };

    const handleSave = async () => {
        try {
            if (editing) { await api.updateBranch(editing.id, form); }
            else { await api.createBranch(form); }
            setShowModal(false);
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminar esta sucursal?')) return;
        try { await api.deleteBranch(id); load(); }
        catch (err: any) { alert(err.message); }
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left"><h1 className="topbar-title">Sucursales</h1></div>
                <div className="topbar-right">
                    <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nueva sucursal</button>
                </div>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Nombre</th><th>Direccion</th><th>Telefono</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--muted-text)' }}>Cargando...</td></tr>
                                ) : branches.length === 0 ? (
                                    <tr><td colSpan={4}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">{Icons.mapPin}</div>
                                            <div className="empty-state-text">Sin sucursales registradas</div>
                                            <div className="empty-state-desc">Agrega tu primera sucursal</div>
                                        </div>
                                    </td></tr>
                                ) : branches.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.name}</strong></td>
                                        <td style={{ fontSize: 13 }}>{b.address || '—'}</td>
                                        <td style={{ fontSize: 13 }}>{b.phone || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(b)}>{Icons.edit}</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>{Icons.trash}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">{editing ? 'Editar sucursal' : 'Nueva sucursal'}</h3>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Nombre *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Direccion</label>
                            <input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefono</label>
                            <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={!form.name}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
