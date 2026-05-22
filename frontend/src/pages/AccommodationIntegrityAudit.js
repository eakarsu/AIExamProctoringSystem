import React, { useEffect, useState } from 'react';

export default function AccommodationIntegrityAudit() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/accommodation-integrity-audit').then(r => r.json()).then(r => setData(r.data || r)).catch(() => setData(null)); }, []);
  return <div className="page"><h1>Accommodation Integrity Audit</h1><p>Separate legitimate accommodations from proctoring rule conflicts before appeals.</p><div className="stats-grid">{data && Object.entries(data.summary).map(([k,v]) => <div className="stat-card" key={k}><span>{k.replaceAll('_',' ')}</span><strong>{v}</strong></div>)}</div><div className="card">{(data?.sessions || []).map(s => <div key={s.session} style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><strong>{s.session}</strong><div>{s.accommodation} - {s.conflict} - {s.action}</div></div>)}</div></div>;
}
