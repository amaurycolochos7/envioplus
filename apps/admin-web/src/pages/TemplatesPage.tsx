import { useState, useEffect } from 'react';
import { api } from '../services/api';

const Icons = {
    plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
    printer: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', content: '', isDefault: false });

    const load = () => {
        setLoading(true);
        api.getTemplates().then(setTemplates).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing(null); setForm({ name: '', content: '', isDefault: false }); setShowModal(true); };
    const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, content: t.content || '', isDefault: t.isDefault || false }); setShowModal(true); };

    const handleSave = async () => {
        try {
            if (editing) { await api.updateTemplate(editing.id, form); }
            else { await api.createTemplate(form); }
            setShowModal(false);
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminar esta plantilla?')) return;
        try { await api.deleteTemplate(id); load(); }
        catch (err: any) { alert(err.message); }
    };

    return (
        <>
            <div className="topbar">
                <div className="topbar-left"><h1 className="topbar-title">Plantillas de impresion</h1></div>
                <div className="topbar-right">
                    <button className="btn btn-primary" onClick={openNew}>{Icons.plus} Nueva plantilla</button>
                </div>
            </div>
            <div className="page-content">
                <div className="card">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead><tr><th>Nombre</th><th>Predeterminada</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: 40, color: 'var(--muted-text)' }}>Cargando...</td></tr>
                                ) : templates.length === 0 ? (
                                    <tr><td colSpan={3}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">{Icons.printer}</div>
                                            <div className="empty-state-text">Sin plantillas</div>
                                            <div className="empty-state-desc">Crea tu primera plantilla de impresion</div>
                                        </div>
                                    </td></tr>
                                ) : templates.map(t => (
                                    <tr key={t.id}>
                                        <td><strong>{t.name}</strong></td>
                                        <td>{t.isDefault ? <span className="badge badge-delivered">Predeterminada</span> : '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}>{Icons.edit}</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>{Icons.trash}</button>
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
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                        <h3 className="modal-title">{editing ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Nombre *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label">Contenido HTML</label>
                            <textarea className="form-textarea" style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                            <label htmlFor="isDefault" className="form-label" style={{ margin: 0 }}>Plantilla predeterminada</label>
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
