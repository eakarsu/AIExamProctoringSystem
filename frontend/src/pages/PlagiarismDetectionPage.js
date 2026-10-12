import AIResultView from '../components/AIResultView';
import AIRecordPresets from '../components/AIRecordPresets';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PlagiarismDetectionPage() {
  const [studentAnswer, setStudentAnswer] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/ai/plagiarism-detection/logs');
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
      const res = await api.post('/ai/plagiarism-detection/analyze', {
        student_answer: studentAnswer,
        original_text: originalText,
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
        <h1>AI Plagiarism Detection</h1>
        <p>AI-powered answer comparison and plagiarism analysis</p>
      </div>
      <div className="page-body">
        <div className="sr-presets"><strong>Fill an example</strong><p>Illustrative text for both editable fields. Review before generating.</p><div className="sr-actions"><button type="button" className="btn btn-secondary btn-sm" onClick={() => { setStudentAnswer('Photosynthesis converts light energy into chemical energy stored in sugars.'); setOriginalText('Plants capture sunlight to make glucose from water and carbon dioxide.'); }}>Paraphrase review</button><button type="button" className="btn btn-secondary btn-sm" onClick={() => { setStudentAnswer('Plants use sunlight, water, and carbon dioxide to make glucose and release oxygen.'); setOriginalText('Using sunlight, plants combine water and carbon dioxide into glucose, releasing oxygen.'); }}>Close wording</button><button type="button" className="btn btn-secondary btn-sm" onClick={() => { setStudentAnswer('In leaves, chlorophyll absorbs light. The plant uses that energy to build sugar from carbon dioxide and water.'); setOriginalText('Photosynthesis occurs in chloroplasts and produces carbohydrates and oxygen.'); }}>Distinct explanation</button></div></div>
        <form className="ai-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student Answer</label>
            <textarea
              className="form-control"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Paste student's answer here..."
              rows={5}
              required
            />
          </div>
          <div className="form-group">
            <label>Original / Reference Text</label>
            <textarea
              className="form-control"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original/reference text here..."
              rows={5}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Plagiarism Detection'}
          </button>
        </form>

        {error && <div style={{ color: '#ef4444', marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}

        {loading && <div className="loading"><div className="spinner"></div></div>}

        {result && <AIResultView title="Analysis report" response={result} />}

        <div className="data-table-container" style={{ marginTop: 32 }}>
          <div className="table-header">
            <h3>Detection Logs</h3>
            <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>Refresh</button>
          </div>
          {logsLoading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Similarity Score</th>
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
                      <td>{log.similarity_score != null ? (parseFloat(log.similarity_score) * 100).toFixed(1) + '%' : '-'}</td>
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
