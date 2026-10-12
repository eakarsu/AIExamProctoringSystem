import React, { useEffect, useState } from 'react';
import api from '../services/api';

/** Fill-only scenarios. Record IDs always come from the user's selection or the API. */
export default function AIRecordPresets({ kind = 'sessions', selectedId, onFill, scenarios, disabled }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    api.get(`/${kind}?limit=100`).then(({ data }) => {
      if (live) setRecords(Array.isArray(data?.data) ? data.data : []);
    }).catch(() => { if (live) setError(`Could not load ${kind}. Select a genuine record before generating.`); });
    return () => { live = false; };
  }, [kind]);
  const chosen = records.find((record) => String(record.id) === String(selectedId));
  const reference = chosen?.id ?? (!selectedId ? records[0]?.id : '');
  return <div className="sr-presets">
    <div><strong>Fill an example</strong><p>Choose a real {kind === 'exams' ? 'exam' : 'session'} and review the illustrative observations before generating.</p></div>
    <select className="form-control" aria-label={`Choose ${kind === 'exams' ? 'exam' : 'session'}`} value={chosen?.id ?? ''} onChange={(event) => onFill(event.target.value, null)}>
      <option value="">Select a {kind === 'exams' ? 'real exam' : 'real session'}</option>
      {records.map((record) => <option key={record.id} value={record.id}>{record.title || record.name || `Record ${record.id}`} (ID {record.id})</option>)}
    </select>
    <div className="sr-actions">{scenarios.map((scenario, index) => {
      const scenarioReference = scenario.value === null ? (chosen?.id ?? (!selectedId ? records[index]?.id : undefined)) : reference;
      return <button key={scenario.label} type="button" className="btn btn-secondary btn-sm" disabled={disabled || !scenarioReference} onClick={() => onFill(scenarioReference, scenario.value, index)}>{scenario.label}</button>;
    })}</div>
    {!reference && <p role="status">{error || (selectedId ? 'This ID is not in the loaded records. Select a listed record; the current value has been preserved.' : `No ${kind} available. Create or select a genuine record to use these examples.`)}</p>}
  </div>;
}
