import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const empty = { name: '', flag: '', enabled: true, severity_weight: 5, description: '' };

export default function MonitoringRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.get('/custom-views/monitoring-rules');
      setRules(res.data.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (editId) {
        await api.put(`/custom-views/monitoring-rules/${editId}`, form);
      } else {
        await api.post('/custom-views/monitoring-rules', form);
      }
      setForm(empty); setEditId(null); await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  };

  const startEdit = (r) => { setEditId(r.id); setForm({ name: r.name, flag: r.flag, enabled: r.enabled, severity_weight: r.severity_weight, description: r.description || '' }); };
  const cancelEdit = () => { setEditId(null); setForm(empty); };
  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try { await api.delete(`/custom-views/monitoring-rules/${id}`); await load(); } catch (e) { setErr(e.response?.data?.error || e.message); }
  };
  const toggleEnabled = async (r) => {
    try { await api.put(`/custom-views/monitoring-rules/${r.id}`, { enabled: !r.enabled }); await load(); } catch (e) { setErr(e.response?.data?.error || e.message); }
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 18 }}>Monitoring Rules Editor (CRUD flags + severity weights)</h3>
        <button onClick={load} style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>{err}</div>}

      {/* Form */}
      <div style={{ background: '#0f172a', padding: 14, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>{editId ? 'Edit Rule' : 'Add Rule'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px', gap: 8, marginBottom: 8 }}>
          <input data-testid="ct-rule-name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13 }} />
          <input data-testid="ct-rule-flag" placeholder="Flag (e.g. tab_switch)" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13 }} />
          <input type="number" min="1" max="10" placeholder="Weight" value={form.severity_weight} onChange={(e) => setForm({ ...form, severity_weight: Number(e.target.value) })} style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 12 }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled
          </label>
        </div>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13, marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-testid="ct-rule-save" onClick={save} disabled={saving || !form.name || !form.flag} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            {saving ? 'Saving...' : (editId ? 'Update' : 'Create')}
          </button>
          {editId && <button onClick={cancelEdit} style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>}
        </div>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}

      {/* Rules table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 90px 200px', gap: 0, fontSize: 13 }}>
        <div style={{ color: '#94a3b8', padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155' }}>Name / Description</div>
        <div style={{ color: '#94a3b8', padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155' }}>Flag</div>
        <div style={{ color: '#94a3b8', padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155', textAlign: 'center' }}>Weight</div>
        <div style={{ color: '#94a3b8', padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155', textAlign: 'center' }}>Enabled</div>
        <div style={{ color: '#94a3b8', padding: '8px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid #334155', textAlign: 'right' }}>Actions</div>
        {rules.map((r) => (
          <React.Fragment key={r.id}>
            <div style={{ padding: '10px', borderBottom: '1px solid #334155' }}>
              <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{r.name}</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{r.description}</div>
            </div>
            <div style={{ padding: '10px', borderBottom: '1px solid #334155', color: '#cbd5e1', fontFamily: 'monospace', fontSize: 12 }}>{r.flag}</div>
            <div style={{ padding: '10px', borderBottom: '1px solid #334155', color: r.severity_weight >= 8 ? '#ef4444' : (r.severity_weight >= 5 ? '#f59e0b' : '#10b981'), textAlign: 'center', fontWeight: 700 }}>{r.severity_weight}</div>
            <div style={{ padding: '10px', borderBottom: '1px solid #334155', textAlign: 'center' }}>
              <button onClick={() => toggleEnabled(r)} style={{ background: r.enabled ? '#10b981' : '#475569', color: 'white', border: 'none', padding: '3px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                {r.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ padding: '10px', borderBottom: '1px solid #334155', textAlign: 'right' }}>
              <button onClick={() => startEdit(r)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11, marginRight: 6 }}>Edit</button>
              <button onClick={() => remove(r.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Delete</button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
