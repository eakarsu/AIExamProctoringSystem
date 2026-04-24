import React from 'react';
import CrudPage from '../components/CrudPage';

const badge = (val) => {
  if (val === true || val === 'true') return <span className="badge badge-red">BLOCKED</span>;
  if (val === false || val === 'false') return <span className="badge badge-green">ALLOWED</span>;
  return <span className="badge badge-gray">{val || 'unknown'}</span>;
};

export default function BrowserSecurityPage() {
  return (
    <CrudPage
      title="Browser Security"
      subtitle="Monitor browser lockdown events and security violations"
      endpoint="/browser-security"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'session_id', label: 'Session ID' },
        { key: 'event_type', label: 'Event Type' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'blocked', label: 'Blocked', badge: true },
        { key: 'timestamp', label: 'Timestamp', render: (val) => val ? new Date(val).toLocaleString() : '-' },
      ]}
      formFields={[
        { name: 'session_id', label: 'Session ID', type: 'number' },
        { name: 'event_type', label: 'Event Type', type: 'select', options: ['tab_switch', 'copy_paste', 'right_click', 'dev_tools', 'screen_capture', 'window_resize', 'focus_lost'] },
        { name: 'details', label: 'Details', type: 'textarea' },
        { name: 'ip_address', label: 'IP Address', placeholder: 'e.g., 192.168.1.1' },
        { name: 'user_agent', label: 'User Agent', placeholder: 'Browser user agent string' },
        { name: 'blocked', label: 'Blocked', type: 'select', options: ['true', 'false'], default: 'false' },
      ]}
      renderBadge={badge}
    />
  );
}
