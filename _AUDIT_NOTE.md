# Audit Notes — AIExamProctoringSystem

## Apply pass 5 (all backlog)

All remaining backlog items implemented additively in `backend/src/routes/extensions.js` (NEW), mounted at `/api/ext`.

Implemented (9 features, cap 10):
- LMS Canvas / Blackboard / Moodle (NEEDS-CREDS) — 503 + `missing: <ENV>` per provider (`CANVAS_API_URL,CANVAS_API_TOKEN`; `BLACKBOARD_API_URL,BLACKBOARD_API_KEY`; `MOODLE_API_URL,MOODLE_API_TOKEN`); sync runs persisted to `lms_sync_log`.
- Eye-gaze biometrics (NEEDS-CREDS) — status endpoint 503 missing `EYE_GAZE_PROVIDER,EYE_GAZE_API_KEY`; sample endpoint additive, computes `off_screen` from viewport coords. PRODUCT-DECISION documented.
- Keystroke biometrics (additive) — `keystroke_biometrics` table; client posts dwell/flight times.
- Appeal workflow (NEEDS-PRODUCT-DECISION) — `appeals` + `appeal_events` tables; 3-tier escalation, 72-hour SLA per tier, statuses `submitted → under_review → resolved_<approved|denied>`. PRODUCT-DECISION inline.
- Stress detection (TOO-RISKY) — triple-gated: requires `STRESS_DETECTION_PROVIDER`, `STRESS_DETECTION_API_KEY`, AND `STRESS_DETECTION_ETHICS_APPROVED=true`; subject `consent_given=true` enforced server-side; no live model invoked.

Smoke test (port 3801): login=200 (admin@examproctor.com); canvas=503; eye-gaze status=503; eye-gaze/sample=200 off_screen=true; appeals POST=200 due_at=+72h; stress=503 missing 2 env vars; unauth=401.

Constraints honored: no `npm install`, no heavy deps, all `CREATE TABLE IF NOT EXISTS`, all env-gated endpoints return `503 + missing: <ENV>`, PRODUCT-DECISION comments inline.

Audit source: `_AUDIT/reports/batch_03.md` § 21 (template-clone, audit reported 0 AI endpoints).

## Original audit recommendations

### Missing AI counterparts
- `/face-verify`, `/behavior-analyze`, `/plagiarism-detect`, `/audio-analyze`.

### Missing non-AI features
- LMS integration (Canvas, Blackboard).
- Question bank.
- Exam scheduling.
- Proctor assignment.
- Appeal workflow.

### Custom feature suggestions
- Agentic real-time proctor.
- Eye-gaze / keystroke biometrics.
- Voice authentication.
- Environment verification.
- Stress detection.
- Accessibility accommodations.
- Post-exam forensic replay.

## Current state observed

Audit's "0 AI endpoints" outdated — `aiBehaviorAnalysis.js`,
`aiFaceVerification.js`, `aiAudioMonitoring.js`, `aiPlagiarismDetection.js`
all expose `/analyze` and `/logs`, plus `aiNew.js` adds session-risk-summary,
exam-integrity-report, proctor-recommendations. All four "missing AI
counterparts" are present.

## Implementations applied this pass

None — the AI surface is already comprehensive. Remaining gaps are
infrastructural / integration and outside mechanical scope.

## Prioritized backlog

1. **MECHANICAL** — Add `/api/ai/post-exam-forensics` aggregating session
   incidents into a replay-ready timeline summary.
2. **NEEDS-CREDS** — LMS integration (Canvas / Blackboard / Moodle) requires
   institutional API tokens.
3. **NEEDS-CREDS** — Eye-gaze and biometric streams require a vision /
   client-SDK pipeline.
4. **NEEDS-PRODUCT-DECISION** — Appeal workflow needs role + escalation
   policy decisions.
5. **TOO-RISKY** — Stress detection (facial micro-expressions) is
   ethically and legally fraught; needs IRB-style review.

## Apply pass 4 (mechanical backlog)

- **Implemented:** `POST /api/ai/new/post-exam-forensics` — aggregates `incidents` + `browser_security_events` into a chronological replay-ready forensic timeline, calls `analyzeWithAI`, persists via `persistAnalysis`. Returns 503 if `OPENROUTER_API_KEY` is unset (both pre-flight check and error-path string match).
- **FE:** Added a "Post-Exam Forensics" tab/section to existing `frontend/src/pages/AIInsightsPage.js` (form + JWT bearer via `services/api` axios interceptor, 503 detection in shared `ErrorBox`).
- **Files modified:**
  - `backend/src/routes/aiNew.js`
  - `frontend/src/pages/AIInsightsPage.js`
- **Syntax check:** `node --check` PASS, `@babel/parser` JSX PASS.
- **Smoke:** backend on port 3801 with `OPENROUTER_API_KEY=""` → login as `admin@examproctor.com` → `POST /api/ai/new/post-exam-forensics` returned `503 {"success":false,"error":"AI service unavailable: OPENROUTER_API_KEY not configured."}`; without bearer → `401`.
- **Backlog still deferred:** LMS integration (NEEDS-CREDS), eye-gaze biometrics (NEEDS-CREDS), appeal workflow (PRODUCT-DECISION), stress detection (TOO-RISKY).

## Apply pass 3 (frontend)

- **Stack:** React (CRA, react-router-dom) + Express backend.
- **Backend AI endpoints surveyed:** `/api/ai/face-verification/*`, `/api/ai/behavior-analysis/*`, `/api/ai/audio-monitoring/*`, `/api/ai/plagiarism-detection/*`, `/api/ai/new/{session-risk-summary, exam-integrity-report, proctor-recommendations}`.
- **FE state before:** Pages existed for the four `/analyze` endpoints; `aiNew.js` (session-risk-summary, exam-integrity-report, proctor-recommendations) had no UI.
- **Action:** CREATED-FE.
- **Files written/modified:**
  - `frontend/src/pages/AIInsightsPage.js` (new) — three forms, JWT auto-attached via existing `services/api.js` axios interceptor (`localStorage.getItem('token')` Bearer), 503-aware error display.
  - `frontend/src/App.js` — imported `AIInsightsPage`, added nav item `AI Insights` and route `/ai/insights`.
- **Syntax check:** PASS (`@babel/parser` JSX parse on both files).
- **Notes:** Reused existing CSS classes (`page-header`, `page-body`, `ai-form`, `ai-output`, `data-table-container`). No deps added.
