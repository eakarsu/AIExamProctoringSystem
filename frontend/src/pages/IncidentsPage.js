import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = {
    low: 'badge-green', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red',
    open: 'badge-yellow', reviewing: 'badge-blue', resolved: 'badge-green', dismissed: 'badge-gray',
  };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'unknown'}</span>;
};

export default function IncidentsPage() {
  return (
    <CrudPage
      title="Incidents"
      subtitle="Track and resolve proctoring incidents"
      endpoint="/incidents"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'severity', label: 'Severity', badge: true },
        { key: 'description', label: 'Description', render: (val) => val && val.length > 50 ? val.substring(0, 50) + '...' : val || '-' },
        { key: 'ai_confidence', label: 'AI Confidence' },
        { key: 'status', label: 'Status', badge: true },
      ]}
      formFields={[
        { name: 'session_id', label: 'Session ID', type: 'number' },
        { name: 'type', label: 'Type', type: 'select', options: ['face_not_detected', 'multiple_faces', 'tab_switch', 'audio_anomaly', 'plagiarism_detected', 'unauthorized_device', 'screen_share', 'identity_mismatch'] },
        { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], default: 'low' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'ai_confidence', label: 'AI Confidence', type: 'number', placeholder: '0-100' },
        { name: 'status', label: 'Status', type: 'select', options: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' },
        { name: 'resolution_notes', label: 'Resolution Notes', type: 'textarea' },
      ]}
      renderBadge={badge}
    />
  );
}
