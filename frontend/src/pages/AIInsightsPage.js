import AIResultView from '../components/AIResultView';
import AIRecordPresets from '../components/AIRecordPresets';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ErrorBox({ error }) {
  if (!error) return null;
  const isMissingKey =
    /no.?key|api.?key|OPENROUTER_API_KEY|503/i.test(String(error)) ||
    /unavailable/i.test(String(error));
  return (
    <div
      style={{
        color: isMissingKey ? '#f59e0b' : '#ef4444',
        marginTop: 16,
        padding: 12,
        background: isMissingKey ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
        border: isMissingKey ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(239,68,68,0.15)',
        borderRadius: 8,
      }}
    >
      {isMissingKey
        ? `AI service unavailable — set OPENROUTER_API_KEY on the backend. (${error})`
        : error}
    </div>
  );
}

export default function AIInsightsPage() {
  const [sessionId, setSessionId] = useState('');
  const [examId, setExamId] = useState('');
  const [proctorSessionId, setProctorSessionId] = useState('');
  const [forensicsSessionId, setForensicsSessionId] = useState('');
  const [riskResult, setRiskResult] = useState(null);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [recsResult, setRecsResult] = useState(null);
  const [forensicsResult, setForensicsResult] = useState(null);
  const [loadingKey, setLoadingKey] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  useEffect(() => { api.get('/ai/new/history').then((res) => setHistory(res.data?.data || [])).catch(() => {}); }, []);

  const callEndpoint = async (key, path, payload, setter) => {
    setError('');
    setter(null);
    setLoadingKey(key);
    try {
      const res = await api.post(path, payload);
      setter(res.data?.data || res.data);
      api.get('/ai/new/history').then((historyRes) => setHistory(historyRes.data?.data || [])).catch(() => {});
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Request failed';
      setError(status === 503 ? `503 ${msg}` : msg);
    } finally {
      setLoadingKey('');
    }
  };

  const handleRisk = (e) => {
    e.preventDefault();
    callEndpoint(
      'risk',
      '/ai/new/session-risk-summary',
      { session_id: parseInt(sessionId, 10) },
      setRiskResult
    );
  };

  const handleIntegrity = (e) => {
    e.preventDefault();
    callEndpoint(
      'integrity',
      '/ai/new/exam-integrity-report',
      { exam_id: parseInt(examId, 10) },
      setIntegrityResult
    );
  };

  const handleRecs = (e) => {
    e.preventDefault();
    callEndpoint(
      'recs',
      '/ai/new/proctor-recommendations',
      { session_id: parseInt(proctorSessionId, 10) },
      setRecsResult
    );
  };

  const handleForensics = (e) => {
    e.preventDefault();
    callEndpoint(
      'forensics',
      '/ai/new/post-exam-forensics',
      { session_id: parseInt(forensicsSessionId, 10) },
      setForensicsResult
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Insights</h1>
        <p>Session risk, exam integrity, and proctor recommendations</p>
      </div>
      <div className="page-body">
        <ErrorBox error={error} />

        <div className="data-table-container" style={{ marginTop: 16 }}>
          <div className="table-header">
            <h3>Session Risk Summary</h3>
          </div>
          <AIRecordPresets kind="sessions" selectedId={sessionId} onFill={(id) => setSessionId(String(id))} scenarios={[{ label: 'Most recent record', value: null }, { label: 'Second recent record', value: null }, { label: 'Third recent record', value: null }]} disabled={loadingKey !== ''} />
          <form className="ai-form" onSubmit={handleRisk}>
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
            <button type="submit" className="btn btn-primary" disabled={loadingKey === 'risk'}>
              {loadingKey === 'risk' ? 'Analyzing...' : 'Generate Risk Summary'}
            </button>
          </form>
          {riskResult && <AIResultView title="Session Risk" response={riskResult} />}
        </div>

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h3>Exam Integrity Report</h3>
          </div>
          <AIRecordPresets kind="exams" selectedId={examId} onFill={(id) => setExamId(String(id))} scenarios={[{ label: 'Most recent record', value: null }, { label: 'Second recent record', value: null }, { label: 'Third recent record', value: null }]} disabled={loadingKey !== ''} />
          <form className="ai-form" onSubmit={handleIntegrity}>
            <div className="form-group">
              <label>Exam ID</label>
              <input
                type="number"
                className="form-control"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                placeholder="Enter exam ID"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loadingKey === 'integrity'}>
              {loadingKey === 'integrity' ? 'Analyzing...' : 'Generate Integrity Report'}
            </button>
          </form>
          {integrityResult && <AIResultView title="Exam Integrity" response={integrityResult} />}
        </div>

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h3>Proctor Recommendations</h3>
          </div>
          <AIRecordPresets kind="sessions" selectedId={proctorSessionId} onFill={(id) => setProctorSessionId(String(id))} scenarios={[{ label: 'Most recent record', value: null }, { label: 'Second recent record', value: null }, { label: 'Third recent record', value: null }]} disabled={loadingKey !== ''} />
          <form className="ai-form" onSubmit={handleRecs}>
            <div className="form-group">
              <label>Session ID</label>
              <input
                type="number"
                className="form-control"
                value={proctorSessionId}
                onChange={(e) => setProctorSessionId(e.target.value)}
                placeholder="Enter session ID"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loadingKey === 'recs'}>
              {loadingKey === 'recs' ? 'Analyzing...' : 'Generate Recommendations'}
            </button>
          </form>
          {recsResult && <AIResultView title="Proctor Recommendations" response={recsResult} />}
        </div>

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h3>Post-Exam Forensics</h3>
          </div>
          <AIRecordPresets kind="sessions" selectedId={forensicsSessionId} onFill={(id) => setForensicsSessionId(String(id))} scenarios={[{ label: 'Most recent record', value: null }, { label: 'Second recent record', value: null }, { label: 'Third recent record', value: null }]} disabled={loadingKey !== ''} />
          <form className="ai-form" onSubmit={handleForensics}>
            <div className="form-group">
              <label>Session ID</label>
              <input
                type="number"
                className="form-control"
                value={forensicsSessionId}
                onChange={(e) => setForensicsSessionId(e.target.value)}
                placeholder="Enter session ID"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loadingKey === 'forensics'}>
              {loadingKey === 'forensics' ? 'Analyzing...' : 'Generate Forensic Timeline'}
            </button>
          </form>
          {forensicsResult && <AIResultView title="Post-Exam Forensics" response={forensicsResult} />}
        </div>
        <section className="data-table-container" style={{ marginTop: 24 }}>
          <div className="table-header"><h3>Saved AI reports</h3></div>
          {history.length === 0 ? <p>No saved reports available.</p> : <ul>{history.map((item) => <li key={item.id}><button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedHistory(item)}>{item.analysis_type.replace(/-/g, ' ')} · {new Date(item.created_at).toLocaleString()}</button></li>)}</ul>}
          {selectedHistory && <AIResultView title={selectedHistory.analysis_type.replace(/-/g, ' ')} response={{ analysis: selectedHistory.content }} label="Saved report" />}
        </section>
      </div>
    </div>
  );
}
