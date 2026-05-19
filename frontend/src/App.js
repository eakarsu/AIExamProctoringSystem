import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExamsPage from './pages/ExamsPage';
import StudentsPage from './pages/StudentsPage';
import ProctorsPage from './pages/ProctorsPage';
import InstitutionsPage from './pages/InstitutionsPage';
import SessionsPage from './pages/SessionsPage';
import IncidentsPage from './pages/IncidentsPage';
import ResultsPage from './pages/ResultsPage';
import FaceVerificationPage from './pages/FaceVerificationPage';
import BehaviorAnalysisPage from './pages/BehaviorAnalysisPage';
import AudioMonitoringPage from './pages/AudioMonitoringPage';
import PlagiarismDetectionPage from './pages/PlagiarismDetectionPage';
import AIInsightsPage from './pages/AIInsightsPage';
import BrowserSecurityPage from './pages/BrowserSecurityPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import SettingsPage from './pages/SettingsPage';

import Batch03Features from './pages/Batch03Features';
import CustomViewsPage from './pages/CustomViewsPage';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return token ? children : <Navigate to="/login" />;
}

const navItems = [
  { section: 'Overview' },
  { path: '/', label: 'Dashboard', icon: '📊' },
  { section: 'Management' },
  { path: '/exams', label: 'Exams', icon: '📝' },
  { path: '/students', label: 'Students', icon: '🎓' },
  { path: '/proctors', label: 'Proctors', icon: '👁️' },
  { path: '/institutions', label: 'Institutions', icon: '🏛️' },
  { section: 'Proctoring' },
  { path: '/sessions', label: 'Sessions', icon: '🖥️' },
  { path: '/incidents', label: 'Incidents', icon: '⚠️' },
  { path: '/results', label: 'Results', icon: '📈' },
  { section: 'AI Analysis' },
  { path: '/ai/face-verification', label: 'Face Verification', icon: '🤖' },
  { path: '/ai/behavior-analysis', label: 'Behavior Analysis', icon: '🧠' },
  { path: '/ai/audio-monitoring', label: 'Audio Monitoring', icon: '🎙️' },
  { path: '/ai/plagiarism-detection', label: 'Plagiarism Detection', icon: '📋' },
  { path: '/ai/insights', label: 'AI Insights', icon: '✨' },
  { section: 'Security' },
  { path: '/browser-security', label: 'Browser Security', icon: '🔒' },
  { path: '/live-monitoring', label: 'Live Monitoring', icon: '📡' },
  { section: 'Custom' },
  { path: '/custom-views', label: 'Proctor Views', icon: '🧩' },
  { section: 'System' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">AI</div>
        <div>
          <h2>ExamProctor</h2>
          <span>AI-Powered Security</span>
        </div>
      </div>

      <nav style={{ paddingBottom: 120 }}>
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section">{item.section}</div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="avatar">{user?.first_name?.[0] || 'A'}{user?.last_name?.[0] || 'U'}</div>
          <div>
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-role">{user?.role || 'Admin'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/batch03" element={<Batch03Features />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/proctors" element={<ProctorsPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/ai/face-verification" element={<FaceVerificationPage />} />
          <Route path="/ai/behavior-analysis" element={<BehaviorAnalysisPage />} />
          <Route path="/ai/audio-monitoring" element={<AudioMonitoringPage />} />
          <Route path="/ai/plagiarism-detection" element={<PlagiarismDetectionPage />} />
          <Route path="/ai/insights" element={<AIInsightsPage />} />
          <Route path="/browser-security" element={<BrowserSecurityPage />} />
          <Route path="/live-monitoring" element={<LiveMonitoringPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
