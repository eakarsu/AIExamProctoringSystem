import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = { active: 'badge-green', inactive: 'badge-gray' };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'active'}</span>;
};

export default function ProctorsPage() {
  return (
    <CrudPage
      title="Proctors"
      subtitle="Manage proctor profiles and assignments"
      endpoint="/proctors"
      columns={[
        { key: 'name', label: 'Name', render: (_, item) => `${item.first_name || ''} ${item.last_name || ''}`.trim() },
        { key: 'email', label: 'Email' },
        { key: 'specialization', label: 'Specialization' },
        { key: 'experience_years', label: 'Experience (yrs)' },
        { key: 'certification', label: 'Certification' },
        { key: 'status', label: 'Status', badge: true },
      ]}
      formFields={[
        { name: 'first_name', label: 'First Name', placeholder: 'First name' },
        { name: 'last_name', label: 'Last Name', placeholder: 'Last name' },
        { name: 'email', label: 'Email', placeholder: 'proctor@example.com' },
        { name: 'phone', label: 'Phone', placeholder: 'Phone number' },
        { name: 'specialization', label: 'Specialization', placeholder: 'e.g., Computer Science' },
        { name: 'experience_years', label: 'Experience (years)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active' },
        { name: 'certification', label: 'Certification', placeholder: 'e.g., Certified Online Proctor' },
        { name: 'institution_id', label: 'Institution ID', type: 'number' },
      ]}
      renderBadge={badge}
    />
  );
}
