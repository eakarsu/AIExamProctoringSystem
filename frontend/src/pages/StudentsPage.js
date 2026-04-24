import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = { active: 'badge-green', suspended: 'badge-red', graduated: 'badge-blue' };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'active'}</span>;
};

export default function StudentsPage() {
  return (
    <CrudPage
      title="Students"
      subtitle="Manage student records and enrollment"
      endpoint="/students"
      columns={[
        { key: 'name', label: 'Name', render: (_, item) => `${item.first_name || ''} ${item.last_name || ''}`.trim() },
        { key: 'email', label: 'Email' },
        { key: 'student_id', label: 'Student ID' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status', badge: true },
      ]}
      formFields={[
        { name: 'first_name', label: 'First Name', placeholder: 'First name' },
        { name: 'last_name', label: 'Last Name', placeholder: 'Last name' },
        { name: 'email', label: 'Email', placeholder: 'student@example.com' },
        { name: 'student_id', label: 'Student ID', placeholder: 'e.g., STU-001' },
        { name: 'institution_id', label: 'Institution ID', type: 'number' },
        { name: 'phone', label: 'Phone', placeholder: 'Phone number' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'suspended', 'graduated'], default: 'active' },
      ]}
      renderBadge={badge}
    />
  );
}
