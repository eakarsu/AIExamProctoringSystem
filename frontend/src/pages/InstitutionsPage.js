import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  const colors = {
    active: 'badge-green', inactive: 'badge-gray',
    basic: 'badge-gray', professional: 'badge-blue', enterprise: 'badge-purple',
  };
  return <span className={`badge ${colors[val] || 'badge-gray'}`}>{val || 'unknown'}</span>;
};

export default function InstitutionsPage() {
  return (
    <CrudPage
      title="Institutions"
      subtitle="Manage institutions and licensing"
      endpoint="/institutions"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'license_type', label: 'License', badge: true },
        { key: 'status', label: 'Status', badge: true },
      ]}
      formFields={[
        { name: 'name', label: 'Name', placeholder: 'Institution name' },
        { name: 'type', label: 'Type', type: 'select', options: ['university', 'college', 'school', 'corporate'] },
        { name: 'address', label: 'Address', placeholder: 'Street address' },
        { name: 'city', label: 'City', placeholder: 'City' },
        { name: 'state', label: 'State', placeholder: 'State/Province' },
        { name: 'country', label: 'Country', placeholder: 'Country' },
        { name: 'email', label: 'Email', placeholder: 'contact@institution.com' },
        { name: 'phone', label: 'Phone', placeholder: 'Phone number' },
        { name: 'license_type', label: 'License Type', type: 'select', options: ['basic', 'professional', 'enterprise'], default: 'basic' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], default: 'active' },
      ]}
      renderBadge={badge}
    />
  );
}
