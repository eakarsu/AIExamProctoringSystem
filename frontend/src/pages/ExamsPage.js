import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = { draft: 'badge-gray', active: 'badge-green', completed: 'badge-blue' };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'draft'}</span>;
};

export default function ExamsPage() {
  return (
    <CrudPage
      title="Exams"
      subtitle="Manage examination catalog and scheduling"
      endpoint="/exams"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'subject', label: 'Subject' },
        { key: 'duration_minutes', label: 'Duration (min)' },
        { key: 'total_marks', label: 'Total Marks' },
        { key: 'passing_marks', label: 'Pass Marks' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'description', label: 'Description', full: true },
      ]}
      formFields={[
        { name: 'title', label: 'Title', placeholder: 'Exam title' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'subject', label: 'Subject', placeholder: 'e.g., Mathematics' },
        { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
        { name: 'total_marks', label: 'Total Marks', type: 'number' },
        { name: 'passing_marks', label: 'Passing Marks', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'completed'], default: 'draft' },
        { name: 'institution_id', label: 'Institution ID', type: 'number' },
      ]}
      renderBadge={badge}
    />
  );
}
