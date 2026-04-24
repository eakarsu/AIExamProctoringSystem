import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function LiveMonitoringPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flagging, setFlagging] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get('/live-monitoring/active-sessions');
      setSessions(Array.isArray(res.data) ? res.data : res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleFlag = async (sessionId) => {
    setFlagging(sessionId);
    try {
      await api.post(`/live-monitoring/session/${sessionId}/flag`, {
        reason: 'Flagged by proctor',
      });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to flag session');
    } finally {
      setFlagging(null);
    }
  };

  const getTrustColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusBadge = (status) => {
    const colors = {
      in_progress: 'badge-green',
      active: 'badge-green',
      flagged: 'badge-red',
      warning: 'badge-yellow',
      completed: 'badge-blue',
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status || 'unknown'}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Live Monitoring</h1>
          <p>Real-time proctoring session monitoring</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchSessions}>Refresh</button>
      </div>
      <div className="page-body">
        {error && (
          <div style={{ color: '#ef4444', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
            <h3>No Active Sessions</h3>
            <p>There are no active proctoring sessions at this time.</p>
          </div>
        ) : (
          <div className="live-grid">
            {sessions.map((session) => {
              const trustScore = parseFloat(session.trust_score) || 0;
              const trustColor = getTrustColor(trustScore);

              return (
                <div className="live-card" key={session.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="live-dot" style={{ background: session.status === 'active' ? '#10b981' : '#f59e0b' }}></span>
                      <strong>{session.student_first_name ? `${session.student_first_name} ${session.student_last_name}` : `Student #${session.student_id || session.id}`}</strong>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="live-info">
                    {session.exam_title && <div><span style={{ color: '#64748b' }}>Exam:</span> {session.exam_title}</div>}
                    {session.exam_id && <div><span style={{ color: '#64748b' }}>Exam ID:</span> {session.exam_id}</div>}
                    {session.session_id && <div><span style={{ color: '#64748b' }}>Session:</span> {session.session_id}</div>}
                    {session.start_time && (
                      <div><span style={{ color: '#64748b' }}>Started:</span> {new Date(session.start_time).toLocaleTimeString()}</div>
                    )}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: '#94a3b8' }}>Trust Score</span>
                      <span style={{ color: trustColor, fontWeight: 600 }}>{trustScore.toFixed(0)}%</span>
                    </div>
                    <div className="trust-bar">
                      <div
                        className="trust-fill"
                        style={{ width: `${trustScore}%`, background: trustColor }}
                      ></div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button
                      className="btn btn-warning btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleFlag(session.id)}
                      disabled={flagging === session.id || session.status === 'flagged'}
                    >
                      {flagging === session.id ? 'Flagging...' : session.status === 'flagged' ? 'Already Flagged' : 'Flag Session'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
