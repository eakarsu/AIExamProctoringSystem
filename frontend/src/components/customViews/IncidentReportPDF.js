import React, { useState } from 'react';
import api from '../../services/api';

export default function IncidentReportPDF() {
  const [sessionId, setSessionId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const generate = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await api.get('/custom-views/incident-report-pdf' + (sessionId ? `?session_id=${sessionId}` : ''));
      setReport(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!report) return;
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.filename || `incident_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 18 }}>Incident Report PDF Export</h3>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          data-testid="ct-report-session"
          placeholder="Session ID (optional)"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 10px', borderRadius: 6, fontSize: 13, flex: 1 }}
        />
        <button onClick={generate} disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {report && (
          <button onClick={download} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Download
          </button>
        )}
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>{err}</div>}

      {report && (
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, display: 'flex', gap: 16 }}>
            <span>File: <strong style={{ color: '#cbd5e1' }}>{report.filename}</strong></span>
            <span>Size: <strong style={{ color: '#cbd5e1' }}>{report.size_bytes} B</strong></span>
            <span>Incidents: <strong style={{ color: '#cbd5e1' }}>{report.incident_count}</strong></span>
          </div>
          <pre style={{ background: '#0f172a', color: '#cbd5e1', padding: 14, borderRadius: 8, fontSize: 11, fontFamily: 'monospace', maxHeight: 360, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
{report.content}
          </pre>
        </div>
      )}
    </div>
  );
}
