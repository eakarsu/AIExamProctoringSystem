import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SETTING_LABELS = {
  ai_sensitivity: 'AI Sensitivity',
  auto_flag_threshold: 'Auto-Flag Threshold',
  browser_lock_enabled: 'Browser Lock',
  audio_monitoring_enabled: 'Audio Monitoring',
  face_check_interval: 'Face Check Interval (seconds)',
  max_incidents_before_flag: 'Max Incidents Before Flag',
  recording_enabled: 'Recording Enabled',
  notification_email: 'Notification Email',
};

const SETTING_DESCRIPTIONS = {
  ai_sensitivity: 'Controls how sensitive the AI analysis engine is (0.0 - 1.0)',
  auto_flag_threshold: 'Trust score threshold below which sessions are automatically flagged',
  browser_lock_enabled: 'Lock the browser during exam to prevent tab switching',
  audio_monitoring_enabled: 'Enable AI-powered audio environment monitoring',
  face_check_interval: 'How often face verification checks are performed',
  max_incidents_before_flag: 'Number of incidents before a session is auto-flagged',
  recording_enabled: 'Enable session recording for later review',
  notification_email: 'Email address for system notifications and alerts',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      const data = res.data;
      // Normalize: could be an object or array of {key, value}
      if (Array.isArray(data)) {
        const obj = {};
        data.forEach((s) => { obj[s.key] = s.value; });
        setSettings(obj);
      } else if (data.data && Array.isArray(data.data)) {
        const obj = {};
        data.data.forEach((s) => { obj[s.key] = s.value; });
        setSettings(obj);
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/settings', settings);
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (key, value) => {
    const booleanFields = ['browser_lock_enabled', 'audio_monitoring_enabled', 'recording_enabled'];
    const numberFields = ['ai_sensitivity', 'auto_flag_threshold', 'face_check_interval', 'max_incidents_before_flag'];

    if (booleanFields.includes(key)) {
      return (
        <select
          className="form-control"
          value={String(value)}
          onChange={(e) => handleChange(key, e.target.value === 'true')}
        >
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      );
    }

    if (key === 'ai_sensitivity') {
      return (
        <input
          type="number"
          className="form-control"
          value={value ?? ''}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          min={0}
          max={1}
          step={0.1}
        />
      );
    }

    if (numberFields.includes(key)) {
      return (
        <input
          type="number"
          className="form-control"
          value={value ?? ''}
          onChange={(e) => handleChange(key, parseInt(e.target.value, 10))}
        />
      );
    }

    if (key === 'notification_email') {
      return (
        <input
          type="email"
          className="form-control"
          value={value ?? ''}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder="admin@example.com"
        />
      );
    }

    return (
      <input
        type="text"
        className="form-control"
        value={value ?? ''}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    );
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>Settings</h1>
          <p>System configuration and preferences</p>
        </div>
        <div className="page-body">
          <div className="loading"><div className="spinner"></div></div>
        </div>
      </div>
    );
  }

  const settingKeys = Object.keys(SETTING_LABELS).filter((key) => key in settings);
  const extraKeys = Object.keys(settings).filter((key) => !(key in SETTING_LABELS));

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>System configuration and preferences</p>
      </div>
      <div className="page-body">
        {error && (
          <div style={{ color: '#ef4444', marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: '#10b981', marginBottom: 16, padding: 12, background: 'rgba(16,185,129,0.08)', borderRadius: 8 }}>
            {success}
          </div>
        )}

        <div className="settings-grid">
          {settingKeys.map((key) => (
            <div className="setting-card" key={key}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>{SETTING_LABELS[key]}</label>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{SETTING_DESCRIPTIONS[key]}</p>
              </div>
              {renderInput(key, settings[key])}
            </div>
          ))}
          {extraKeys.map((key) => (
            <div className="setting-card" key={key}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 600, fontSize: 14 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
              </div>
              {renderInput(key, settings[key])}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '12px 32px', fontSize: 15 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
