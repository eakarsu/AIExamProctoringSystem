import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function CrudPage({ title, subtitle, endpoint, columns, formFields, renderBadge }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get(endpoint);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openDetail = (item) => { setSelected(item); setShowDetail(true); };
  const closeDetail = () => { setSelected(null); setShowDetail(false); };

  const openNew = () => {
    setEditItem(null);
    const initial = {};
    formFields.forEach(f => { initial[f.name] = f.default || ''; });
    setFormData(initial);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const data = {};
    formFields.forEach(f => { data[f.name] = item[f.name] ?? f.default ?? ''; });
    setFormData(data);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`${endpoint}/${editItem.id}`, formData);
      } else {
        await api.post(endpoint, formData);
      }
      setShowForm(false);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return;
    try {
      await api.delete(`${endpoint}/${item.id}`);
      closeDetail();
      fetchItems();
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return <><div className="page-header"><div><h1>{title}</h1></div></div><div className="loading"><div className="spinner"></div></div></>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New {title.replace(/s$/, '').replace(/ie$/, 'y')}</button>
      </div>
      <div className="page-body">
        <div className="data-table-container">
          <div className="table-header">
            <h3>{items.length} {title}</h3>
          </div>
          {items.length === 0 ? (
            <div className="empty-state"><h3>No {title.toLowerCase()} found</h3><p>Create your first entry to get started.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} onClick={() => openDetail(item)}>
                    <td>{i + 1}</td>
                    {columns.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render(item[c.key], item) : (renderBadge && c.badge ? renderBadge(item[c.key]) : item[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{title.replace(/s$/, '')} Details</h2>
              <button className="modal-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {columns.map(c => (
                  <div key={c.key} className={c.full ? 'detail-item detail-full' : 'detail-item'}>
                    <label>{c.label}</label>
                    <span>{c.render ? c.render(selected[c.key], selected) : (selected[c.key] ?? '—')}</span>
                  </div>
                ))}
                <div className="detail-item">
                  <label>ID</label>
                  <span>{selected.id}</span>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <span>{selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected)}>Delete</button>
              <button className="btn btn-primary btn-sm" onClick={() => openEdit(selected)}>Edit</button>
              <button className="btn btn-secondary btn-sm" onClick={closeDetail}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editItem ? 'Edit' : 'New'} {title.replace(/s$/, '').replace(/ie$/, 'y')}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formFields.map(f => (
                <div key={f.name} className="form-group">
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      className="form-control"
                      value={formData[f.name] || ''}
                      onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      className="form-control"
                      value={formData[f.name] || ''}
                      onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                      placeholder={f.placeholder || ''}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      className="form-control"
                      value={formData[f.name] || ''}
                      onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                      placeholder={f.placeholder || ''}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
