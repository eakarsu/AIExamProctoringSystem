import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { renderToStaticMarkup } from 'react-dom/server';
import AIRecordPresets from './components/AIRecordPresets';
import AIResultView from './components/AIResultView';
import Login from './pages/Login';
import FaceVerificationPage from './pages/FaceVerificationPage';
import PlagiarismDetectionPage from './pages/PlagiarismDetectionPage';
import AIInsightsPage from './pages/AIInsightsPage';
import Batch03Features from './pages/Batch03Features';
import api from './services/api';

jest.mock('./services/api', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('./context/AuthContext', () => ({ useAuth: () => ({ login: jest.fn() }) }));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, host;
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); jest.clearAllMocks(); });

test('record presets fill real ID and observations without submitting', async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: 42, title: 'Actual session' }] } });
  const fill = jest.fn();
  await act(async () => root.render(<AIRecordPresets selectedId="" onFill={fill} scenarios={[
    { label: 'Routine', value: 'Ordinary activity' }, { label: 'Concern', value: 'Observed concern' }, { label: 'Review', value: 'Human review' }
  ]} />));
  const buttons = [...host.querySelectorAll('button')];
  expect(buttons).toHaveLength(3);
  await act(async () => buttons[1].click());
  expect(fill).toHaveBeenCalledWith(42, 'Observed concern', 1);
  expect(api.post).not.toHaveBeenCalled();
});

test('missing records keep preset buttons disabled', async () => {
  api.get.mockResolvedValue({ data: { data: [] } });
  await act(async () => root.render(<AIRecordPresets onFill={jest.fn()} scenarios={[{ label: 'A', value: 'x' }, { label: 'B', value: 'y' }]} />));
  expect([...host.querySelectorAll('button')].every((button) => button.disabled)).toBe(true);
  expect(host.textContent).toMatch(/No sessions available/);
});

test('returned and saved JSON renders sections, table, false, zero, empty string', () => {
  const report = { analysis: JSON.stringify({ eligible: false, score: 0, note: '', facts: { source: 'Exam' }, findings: [{ item: 'A', count: 0 }, { item: 'B', count: 2 }] }) };
  const html = renderToStaticMarkup(<AIResultView response={report} title="Saved report" />);
  expect(html).toMatch(/Eligible/);
  expect(html).toMatch(/No/);
  expect(html).toMatch(/>0</);
  expect(html).toMatch(/Empty string/);
  expect(html).toMatch(/<table/);
  expect(html).toMatch(/Source/);
  expect(html).not.toMatch(/&quot;eligible&quot;/);
});

test('demo fill does not submit; missing credentials remain explicit', async () => {
  const oldEmail = process.env.REACT_APP_DEMO_EMAIL, oldPassword = process.env.REACT_APP_DEMO_PASSWORD;
  try {
    process.env.REACT_APP_DEMO_EMAIL = 'demo@example.test'; process.env.REACT_APP_DEMO_PASSWORD = 'fixture-only';
    await act(async () => root.render(<Login />));
    let submitted = 0; host.querySelector('form').addEventListener('submit', () => submitted++);
    await act(async () => host.querySelector('.btn-fill-credentials').click());
    expect(host.querySelector('input[type=email]').value).toBe('demo@example.test');
    expect(host.querySelector('input[type=password]').value).toBe('fixture-only');
    expect(submitted).toBe(0);
    delete process.env.REACT_APP_DEMO_EMAIL; delete process.env.REACT_APP_DEMO_PASSWORD;
    await act(async () => host.querySelector('.btn-fill-credentials').click());
    expect(host.textContent).toMatch(/not configured/);
    expect(submitted).toBe(0);
  } finally {
    if (oldEmail === undefined) delete process.env.REACT_APP_DEMO_EMAIL; else process.env.REACT_APP_DEMO_EMAIL = oldEmail;
    if (oldPassword === undefined) delete process.env.REACT_APP_DEMO_PASSWORD; else process.env.REACT_APP_DEMO_PASSWORD = oldPassword;
  }
});

test('face preset fills both fields and saved log opens structured report', async () => {
  api.get.mockImplementation((path) => Promise.resolve({ data: { data: path.startsWith('/sessions')
    ? [{ id: 17, title: 'Live session' }]
    : [{ id: 3, session_id: 17, analysis: JSON.stringify({ match: false, confidence: 0, note: '' }), recommendations: '[]' }] } }));
  await act(async () => root.render(<FaceVerificationPage />));
  const routine = [...host.querySelectorAll('button')].find((button) => button.textContent === 'Routine identity check');
  await act(async () => routine.click());
  expect(host.querySelector('input[type=number]').value).toBe('17');
  expect(host.querySelector('textarea').value).toMatch(/One face remains/);
  expect(api.post).not.toHaveBeenCalled();
  const view = [...host.querySelectorAll('button')].find((button) => button.textContent === 'View report');
  await act(async () => view.click());
  expect(host.textContent).toMatch(/Saved analysis report/);
  expect(host.textContent).toMatch(/Match/);
  expect(host.textContent).toMatch(/Empty string/);
});

test('plagiarism preset fills both text fields without invoking analysis', async () => {
  api.get.mockResolvedValue({ data: { data: [] } });
  await act(async () => root.render(<PlagiarismDetectionPage />));
  const preset = [...host.querySelectorAll('button')].find((button) => button.textContent === 'Close wording');
  await act(async () => preset.click());
  expect([...host.querySelectorAll('textarea')].map((item) => item.value).every(Boolean)).toBe(true);
  expect(api.post).not.toHaveBeenCalled();
});

test('AI Insights preset uses actual listed exam and session IDs only', async () => {
  api.get.mockImplementation((path) => Promise.resolve({ data: { data: path.startsWith('/exams')
    ? [{ id: 81, title: 'Exam A' }, { id: 82, title: 'Exam B' }]
    : path.startsWith('/sessions') ? [{ id: 31 }, { id: 32 }, { id: 33 }] : [] } }));
  await act(async () => root.render(<AIInsightsPage />));
  const second = [...host.querySelectorAll('button')].filter((button) => button.textContent === 'Second recent record');
  await act(async () => second[0].click());
  await act(async () => second[1].click());
  expect([...host.querySelectorAll('input[type=number]')].map((input) => input.value).slice(0, 2)).toEqual(['32', '82']);
  expect(api.post).not.toHaveBeenCalled();
});

test('Batch03 optional prompt presets fill text without running', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(() => Promise.reject(new Error('Unexpected request')));
  try {
    await act(async () => root.render(<Batch03Features />));
    const sample = [...host.querySelectorAll('button')].find((button) => button.textContent === 'Executive review');
    await act(async () => sample.click());
    expect(host.querySelector('textarea').value).toMatch(/exam operations lead/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally { fetchSpy.mockRestore(); }
});

test('returned analysis JSON renders on the actual form after a mocked response', async () => {
  api.get.mockImplementation((path) => Promise.resolve({ data: { data: path.startsWith('/sessions') ? [{ id: 17 }] : [] } }));
  api.post.mockResolvedValue({ data: { data: { analysis: JSON.stringify({ verified: false, score: 0, note: '' }) } } });
  await act(async () => root.render(<FaceVerificationPage />));
  await act(async () => [...host.querySelectorAll('button')].find((button) => button.textContent === 'Routine identity check').click());
  await act(async () => host.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.post).toHaveBeenCalledWith('/ai/face-verification/analyze', { session_id: 17, face_description: expect.any(String) });
  expect(host.textContent).toMatch(/Verified/);
  expect(host.textContent).toMatch(/Empty string/);
  expect(host.textContent).toMatch(/Score/);
});

test('saved Insights history renders structured JSON from persisted content', async () => {
  api.get.mockImplementation((path) => Promise.resolve({ data: { data: path === '/ai/new/history'
    ? [{ id: 6, analysis_type: 'session-risk-summary', created_at: '2026-01-01T00:00:00Z', content: JSON.stringify({ elevated: false, incident_count: 0, note: '' }) }]
    : [{ id: 31 }] } }));
  await act(async () => root.render(<AIInsightsPage />));
  await act(async () => [...host.querySelectorAll('button')].find((button) => button.textContent.includes('session risk summary')).click());
  expect(host.textContent).toMatch(/Saved report/);
  expect(host.textContent).toMatch(/Incident count/);
  expect(host.textContent).toMatch(/Empty string/);
});

test('unlisted typed record is preserved and presets cannot replace it', async () => {
  api.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });
  const fill = jest.fn();
  await act(async () => root.render(<AIRecordPresets selectedId="999" onFill={fill} scenarios={[{ label: 'Review', value: 'Check' }]} />));
  expect(host.querySelector('button').disabled).toBe(true);
  expect(host.textContent).toMatch(/current value has been preserved/);
  expect(fill).not.toHaveBeenCalled();
});
