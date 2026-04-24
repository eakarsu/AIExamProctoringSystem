import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const features = [
  { key: 'total_exams', label: 'Exams', icon: '📝', color: '#3b82f6', path: '/exams', desc: 'Manage examination catalog' },
  { key: 'total_students', label: 'Students', icon: '🎓', color: '#10b981', path: '/students', desc: 'Student enrollment & profiles' },
  { key: null, label: 'Proctors', icon: '👁️', color: '#8b5cf6', path: '/proctors', desc: 'Proctor management' },
  { key: 'total_institutions', label: 'Institutions', icon: '🏛️', color: '#f59e0b', path: '/institutions', desc: 'Institution partnerships' },
  { key: 'total_sessions', label: 'Sessions', icon: '🖥️', color: '#06b6d4', path: '/sessions', desc: 'Proctoring session control' },
  { key: 'total_incidents', label: 'Incidents', icon: '⚠️', color: '#ef4444', path: '/incidents', desc: 'Security incident tracking' },
  { key: null, label: 'Results', icon: '📈', color: '#14b8a6', path: '/results', desc: 'Exam results & analytics' },
  { key: null, label: 'AI Face Verify', icon: '🤖', color: '#6366f1', path: '/ai/face-verification', desc: 'AI-powered identity verification' },
  { key: null, label: 'AI Behavior', icon: '🧠', color: '#a855f7', path: '/ai/behavior-analysis', desc: 'AI behavior pattern analysis' },
  { key: null, label: 'AI Audio', icon: '🎙️', color: '#ec4899', path: '/ai/audio-monitoring', desc: 'AI audio environment monitoring' },
  { key: null, label: 'AI Plagiarism', icon: '📋', color: '#f97316', path: '/ai/plagiarism-detection', desc: 'AI plagiarism detection engine' },
  { key: null, label: 'Browser Security', icon: '🔒', color: '#64748b', path: '/browser-security', desc: 'Browser lock & security events' },
  { key: 'active_sessions', label: 'Live Monitoring', icon: '📡', color: '#22d3ee', path: '/live-monitoring', desc: 'Real-time session monitoring' },
  { key: null, label: 'Settings', icon: '⚙️', color: '#78716c', path: '/settings', desc: 'System configuration' },
];

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data || {})).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>AI Exam Proctoring System Overview</p>
        </div>
      </div>
      <div className="page-body">
        <div className="cards-grid">
          {features.map(f => (
            <div key={f.key} className="stat-card" onClick={() => navigate(f.path)}>
              <div className="card-icon" style={{ background: `${f.color}20` }}>
                <span>{f.icon}</span>
              </div>
              <h3>{stats[f.key] ?? '—'}</h3>
              <p>{f.label}</p>
              <span style={{ fontSize: 12, color: '#475569', marginTop: 4, display: 'block' }}>{f.desc}</span>
              <div className="card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
