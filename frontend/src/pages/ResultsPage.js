import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = { passed: 'badge-green', failed: 'badge-red', under_review: 'badge-yellow', invalidated: 'badge-gray' };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'unknown'}</span>;
};

export default function ResultsPage() {
  return (
    <CrudPage
      title="Results"
      subtitle="View and manage exam results and grades"
      endpoint="/results"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'student_id', label: 'Student ID' },
        { key: 'exam_id', label: 'Exam ID' },
        { key: 'score', label: 'Score' },
        { key: 'percentage', label: 'Percentage', render: (val) => val != null ? `${val}%` : '-' },
        { key: 'grade', label: 'Grade' },
        { key: 'trust_score', label: 'Trust Score' },
        { key: 'status', label: 'Status', badge: true },
      ]}
      formFields={[
        { name: 'session_id', label: 'Session ID', type: 'number' },
        { name: 'exam_id', label: 'Exam ID', type: 'number' },
        { name: 'student_id', label: 'Student ID', type: 'number' },
        { name: 'score', label: 'Score', type: 'number' },
        { name: 'total_marks', label: 'Total Marks', type: 'number' },
        { name: 'percentage', label: 'Percentage', type: 'number' },
        { name: 'grade', label: 'Grade', placeholder: 'e.g., A, B+, C' },
        { name: 'trust_score', label: 'Trust Score', type: 'number' },
        { name: 'incidents_count', label: 'Incidents Count', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['passed', 'failed', 'under_review', 'invalidated'], default: 'passed' },
        { name: 'completed_at', label: 'Completed At', type: 'datetime-local' },
      ]}
      renderBadge={badge}
    />
  );
}
