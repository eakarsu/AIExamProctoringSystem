import React, { useState, useEffect } from 'react';
import api from '../services/api';

const renderAIOutput = (analysis, confidence, riskLevel, recommendations) => {
  if (!analysis) return null;

  const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
  const riskColor = riskColors[riskLevel] || '#64748b';

  const paragraphs = analysis.split('\n').filter(p => p.trim());

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <span className="ai-badge">AI Analysis</span>
        <span className="ai-model">Powered by Claude Haiku 4.5 via OpenRouter</span>
      </div>
      <div className="ai-output-body">
        {paragraphs.map((p, i) => {
          const trimmed = p.trim();
          if (trimmed.startsWith('##') || trimmed.startsWith('**')) {
            return <h4 key={i}>{trimmed.replace(/^[#*]+\s*/, '').replace(/\*\*$/, '')}</h4>;
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return <li key={i} style={{ marginLeft: 20, color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{trimmed.slice(2)}</li>;
          }
          if (trimmed.match(/^\d+\./)) {
            return <li key={i} style={{ marginLeft: 20, color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{trimmed}</li>;
          }
          return <p key={i}>{trimmed}</p>;
        })}
      </div>
      <div className="ai-metrics">
        <div className="ai-metric">
          <div className="value" style={{ color: riskColor }}>{(parseFloat(confidence) * 100).toFixed(1)}%</div>
          <div className="label">Confidence</div>
        </div>
        <div className="ai-metric">
          <div className="value" style={{ color: riskColor }}>{(riskLevel || 'N/A').toUpperCase()}</div>
          <div className="label">Risk Level</div>
        </div>
        <div className="ai-metric">
          <div className="value" style={{ color: '#3b82f6' }}>{recommendations ? 'Yes' : 'N/A'}</div>
          <div className="label">Recommendations</div>
        </div>
      </div>
      {recommendations && (
        <div style={{ marginTop: 16, padding: 16, background: 'rgba(59,130,246,0.05)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
          <h4 style={{ color: '#3b82f6', fontSize: 13, marginBottom: 8 }}>Recommendations</h4>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{recommendations}</p>
        </div>
      )}
    </div>
  );
};

export default function AudioMonitoringPage() {
  const [sessionId, setSessionId] = useState('');
  const [audioData, setAudioData] = useState('');
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/ai/audio-monitoring/logs');
      setLogs(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/ai/audio-monitoring/analyze', {
        session_id: parseInt(sessionId, 10),
        audio_data: audioData,
      });
      setResult(res.data.data || res.data);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const riskBadge = (level) => {
    const colors = { low: 'badge-green', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-purple' };
    return <span className={`badge ${colors[level] || 'badge-gray'}`}>{level || 'unknown'}</span>;
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString();
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Audio Monitoring</h1>
        <p>AI-powered audio environment analysis</p>
      </div>
      <div className="page-body">
        <form className="ai-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Session ID</label>
            <input
              type="number"
              className="form-control"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID"
              required
            />
          </div>
          <div className="form-group">
            <label>Audio Data</label>
            <textarea
              className="form-control"
              value={audioData}
              onChange={(e) => setAudioData(e.target.value)}
              placeholder="Describe audio observations: background noise, voices, suspicious sounds..."
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Audio Analysis'}
          </button>
        </form>

        {error && <div style={{ color: '#ef4444', marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {result && renderAIOutput(result.analysis, result.confidence, result.risk_level, result.recommendations)}

        <div className="data-table-container" style={{ marginTop: 32 }}>
          <div className="table-header">
            <h3>Monitoring Logs</h3>
            <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>Refresh</button>
          </div>
          {logsLoading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Session ID</th>
                  <th>Risk Level</th>
                  <th>Confidence</th>
                  <th>Analyzed At</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No logs yet</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.session_id}</td>
                      <td>{riskBadge(log.risk_level)}</td>
                      <td>{log.confidence ? (parseFloat(log.confidence) * 100).toFixed(1) + '%' : '-'}</td>
                      <td>{formatDate(log.analyzed_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
