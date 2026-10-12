import AIResultView from '../components/AIResultView';
import AIRecordPresets from '../components/AIRecordPresets';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function FaceVerificationPage() {
  const [sessionId, setSessionId] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/ai/face-verification/logs');
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
      const res = await api.post('/ai/face-verification/analyze', {
        session_id: parseInt(sessionId, 10),
        face_description: description,
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
        <h1>AI Face Verification</h1>
        <p>AI-powered identity verification and face detection</p>
      </div>
      <div className="page-body">
        <AIRecordPresets selectedId={sessionId} onFill={(id, value) => { setSessionId(String(id)); if (value !== null) setDescription(value); }} scenarios={[
    { label: 'Routine identity check', value: 'One face remains visible throughout the check; lighting is steady and the student matches the enrollment photo.' },
    { label: 'Lighting concern', value: 'The face is intermittently obscured by backlighting. Request a clearer view before making an identity decision.' },
    { label: 'Second person observed', value: 'A second person appears briefly behind the student. Mark the moment for human review.' }
  ]} disabled={loading} />
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
            <label>Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what was observed in the webcam feed..."
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Face Verification'}
          </button>
        </form>

        {error && <div style={{ color: '#ef4444', marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {result && <AIResultView title="Analysis report" response={result} />}

        <div className="data-table-container" style={{ marginTop: 32 }}>
          <div className="table-header">
            <h3>Verification Logs</h3>
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
                  <th>Analyzed At</th><th>Report</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No logs yet</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.session_id}</td>
                      <td>{riskBadge(log.risk_level)}</td>
                      <td>{log.confidence != null ? (parseFloat(log.confidence) * 100).toFixed(1) + '%' : '-'}</td>
                      <td>{formatDate(log.analyzed_at)}</td><td><button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(log)}>View report</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {selectedLog && <AIResultView title="Saved analysis report" response={selectedLog} label="History" />}
      </div>
    </div>
  );
}
