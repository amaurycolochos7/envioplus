import { useState, useEffect } from 'react';
import { api } from '../services/api';

const ROLE_BADGE: Record<string, string> = {
    ADMIN: 'badge-admin', SUPERVISOR: 'badge-supervisor', OPERATOR: 'badge-operator',
};

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', OPERATOR: 'Operador',
};

const Icons = {
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
    xCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
};

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OPERATOR', branchId: '' });

    const load = () => {
        setLoading(true);
        Promise.all([api.getUsers(), api.getBranches()])
            .then(([u, b]) => { setUsers(u); setBranches(b); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'OPERATOR', branchId: '' }); setShowModal(true); };
    const openEdit = (u: any) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, branchId: u.branchId || '' }); setShowModal(true); };

    const handleSave = async () => {
        try {
            const payload: any = { name: form.name, email: form.email, role: form.role, branchId: form.branchId || undefined };
            if (editing) { await api.updateUser(editing.id, payload); }
            else { payload.password = form.password; await api.createUser(payload); }
            setShowModal(false);
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleDeactivate = async (id: string) => {
        if (!confirm('Desactivar este usuario?')) return;
        try { await api.deleteUser(id); load(); }
        catch (err: any) { alert(err.message); }
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left"><h1 className="topbar-title">Usuarios</h1></div>
                <div className="topbar-right">
                    <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nuevo usuario</button>
                </div>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Sucursal</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted-text)' }}>Cargando...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">{Icons.users}</div>
                                            <div className="empty-state-text">Sin usuarios registrados</div>
                                        </div>
                                    </td></tr>
                                ) : users.map(u => (
                                    <tr key={u.id} style={u.active === false ? { opacity: 0.5 } : {}}>
                                        <td><strong>{u.name}</strong></td>
                                        <td style={{ fontSize: 13 }}>{u.email}</td>
                                        <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-operator'}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                                        <td style={{ fontSize: 13 }}>{u.branch?.name || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(u)}>{Icons.edit}</button>
                                                {u.active !== false && (
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(u.id)} title="Desactivar">
                                                        {Icons.xCircle}
                                                    </button>
                                                )}
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
                        <h3 className="modal-title">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h3>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Nombre *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Email *</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        {!editing && (
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label className="form-label">Contrasena *</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                        )}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="OPERATOR">Operador</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sucursal</label>
                                <select className="form-select" value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })}>
                                    <option value="">-- Sin asignar --</option>
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={!form.name || !form.email}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
