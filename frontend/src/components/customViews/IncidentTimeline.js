import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const SEV_COLOR = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#7f1d1d',
};

export default function IncidentTimeline() {
  const [sessionId, setSessionId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetchTimeline = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.get('/custom-views/incident-timeline' + (sessionId ? `?session_id=${sessionId}` : ''));
      setData(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTimeline(); }, []); // eslint-disable-line

  const events = data?.events || [];
  const maxOffset = events.reduce((m, e) => Math.max(m, e.minute_offset || 0), 1) || 1;

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 18 }}>Incident Timeline (per session)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            data-testid="ct-session-input"
            placeholder="Session ID (optional)"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13 }}
          />
          <button onClick={fetchTimeline} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Refresh</button>
        </div>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading...</div>}
      {err && <div style={{ color: '#ef4444' }}>{err}</div>}
      {data && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
            <span>Total: <strong style={{ color: '#f1f5f9' }}>{data.total_events}</strong></span>
            {data.severity_counts && Object.entries(data.severity_counts).map(([sev, n]) => (
              <span key={sev} style={{ color: SEV_COLOR[sev] || '#94a3b8' }}>{sev}: <strong>{n}</strong></span>
            ))}
          </div>

          {/* Timeline bar */}
          <div style={{ position: 'relative', height: 60, background: '#0f172a', borderRadius: 8, marginBottom: 12, padding: '0 16px' }}>
            <div style={{ position: 'absolute', top: 30, left: 16, right: 16, height: 2, background: '#334155' }} />
            {events.map((ev) => {
              const left = `${(ev.minute_offset / maxOffset) * 100}%`;
              return (
                <div
                  key={ev.id}
                  data-testid="ct-event-dot"
                  title={`${ev.type} [${ev.severity}] @ ${ev.minute_offset}m`}
                  style={{
                    position: 'absolute',
                    top: 22,
                    left: `calc(${left} + 16px - 8px)`,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: SEV_COLOR[ev.severity] || '#3b82f6',
                    border: '2px solid #1e293b',
                  }}
                />
              );
            })}
            <div style={{ position: 'absolute', bottom: 4, left: 16, fontSize: 10, color: '#64748b' }}>0m</div>
            <div style={{ position: 'absolute', bottom: 4, right: 16, fontSize: 10, color: '#64748b' }}>{maxOffset}m</div>
          </div>

          {/* Event list */}
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '60px 90px 120px 1fr 80px', gap: 8, padding: '8px 10px', borderBottom: '1px solid #334155', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>+{ev.minute_offset}m</span>
                <span style={{ background: SEV_COLOR[ev.severity] || '#475569', color: 'white', padding: '2px 8px', borderRadius: 4, textAlign: 'center', fontSize: 11, textTransform: 'uppercase' }}>{ev.severity}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{ev.type}</span>
                <span style={{ color: '#cbd5e1' }}>{ev.description}</span>
                <span style={{ color: '#64748b', textAlign: 'right' }}>{ev.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
