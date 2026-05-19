import React, { useEffect, useState } from 'react';
import api from '../../services/api';

// Score-to-color (green high, red low)
function scoreColor(score) {
  if (score == null) return '#334155';
  const s = Math.max(0, Math.min(100, score));
  // 0=red, 100=green
  const r = Math.round(239 - (239 - 16) * (s / 100));
  const g = Math.round(68 + (185 - 68) * (s / 100));
  const b = Math.round(68 + (129 - 68) * (s / 100));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function IntegrityHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.get('/custom-views/integrity-heatmap');
      setData(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 18 }}>Integrity Score Heatmap (Student x Exam)</h3>
        <button onClick={load} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {err && <div style={{ color: '#ef4444' }}>{err}</div>}

      {data && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 3, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ color: '#94a3b8', textAlign: 'left', padding: '4px 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Student / Exam</th>
                {data.exams.map((ex) => (
                  <th key={ex.id} style={{ color: '#cbd5e1', padding: '4px 8px', fontSize: 11, fontWeight: 500, textAlign: 'center', maxWidth: 90 }}>
                    {ex.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row) => (
                <tr key={row.student_id}>
                  <td style={{ color: '#e2e8f0', padding: '4px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.label}</td>
                  {row.cells.map((c) => (
                    <td
                      key={c.exam_id}
                      data-testid="ct-heat-cell"
                      title={`${row.label} | ${c.exam_title}: ${c.score}`}
                      style={{
                        background: scoreColor(c.score),
                        color: c.score > 55 ? '#0f172a' : 'white',
                        padding: '12px 14px',
                        borderRadius: 6,
                        textAlign: 'center',
                        fontWeight: 700,
                        minWidth: 56,
                      }}
                    >
                      {c.score}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 11, color: '#94a3b8' }}>
            <span>Low</span>
            <div style={{ width: 200, height: 12, borderRadius: 6, background: 'linear-gradient(to right, rgb(239,68,68), rgb(245,158,11), rgb(16,185,129))' }} />
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
}
