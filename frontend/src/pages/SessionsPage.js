import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = {
    scheduled: 'badge-blue', in_progress: 'badge-yellow', completed: 'badge-green',
    flagged: 'badge-red', cancelled: 'badge-gray',
  };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'scheduled'}</span>;
};

export default function SessionsPage() {
  return (
    <CrudPage
      title="Sessions"
      subtitle="Monitor and manage exam proctoring sessions"
      endpoint="/sessions"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'exam_id', label: 'Exam ID' },
        { key: 'student_id', label: 'Student ID' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'trust_score', label: 'Trust Score' },
        { key: 'start_time', label: 'Start Time', render: (val) => val ? new Date(val).toLocaleString() : '-' },
      ]}
      formFields={[
        { name: 'exam_id', label: 'Exam ID', type: 'number' },
        { name: 'student_id', label: 'Student ID', type: 'number' },
        { name: 'proctor_id', label: 'Proctor ID', type: 'number' },
        { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
        { name: 'end_time', label: 'End Time', type: 'datetime-local' },
        { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'in_progress', 'completed', 'flagged', 'cancelled'], default: 'scheduled' },
        { name: 'trust_score', label: 'Trust Score', type: 'number' },
        { name: 'browser_locked', label: 'Browser Locked', type: 'select', options: ['true', 'false'], default: 'false' },
        { name: 'webcam_enabled', label: 'Webcam Enabled', type: 'select', options: ['true', 'false'], default: 'true' },
        { name: 'audio_enabled', label: 'Audio Enabled', type: 'select', options: ['true', 'false'], default: 'true' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      renderBadge={badge}
    />
  );
}
