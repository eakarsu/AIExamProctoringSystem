import React from 'react';
import IncidentTimeline from '../components/customViews/IncidentTimeline';
import IntegrityHeatmap from '../components/customViews/IntegrityHeatmap';
import IncidentReportPDF from '../components/customViews/IncidentReportPDF';
import MonitoringRulesEditor from '../components/customViews/MonitoringRulesEditor';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 data-testid="ct-page-title" style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Proctor Views</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Custom proctoring views: incident timelines, integrity heatmaps, exportable reports and monitoring-rule management.
        </p>
      </div>

      <IncidentTimeline />
      <IntegrityHeatmap />
      <IncidentReportPDF />
      <MonitoringRulesEditor />
    </div>
  );
}
