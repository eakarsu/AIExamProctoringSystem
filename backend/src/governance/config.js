module.exports = {
  caseType: 'proctored_exam_session', initialState: 'draft',
  states: ['draft', 'consented', 'in_progress', 'pending_human_review', 'closed', 'appealed', 'retained'],
  createRoles: ['admin', 'institution_admin', 'proctor'],
  evidenceKinds: ['consent_receipt', 'identity_provider_result', 'lms_roster_snapshot', 'session_event', 'accommodation_grant', 'review_note'],
  requiredSignals: ['consentRecorded', 'identityProviderStatus', 'eventCount', 'policyVersion'],
  transitions: [
    { from: 'draft', action: 'record_consent', to: 'consented', roles: ['admin', 'institution_admin', 'proctor'], requiresEvidence: true },
    { from: 'consented', action: 'start', to: 'in_progress', roles: ['proctor'], requiresEvidence: true },
    { from: 'in_progress', action: 'submit_review', to: 'pending_human_review', roles: ['proctor'], requiresEvidence: true },
    { from: 'pending_human_review', action: 'close', to: 'closed', roles: ['institution_admin'], requiresEvidence: true, dualControl: true },
    { from: 'closed', action: 'appeal', to: 'appealed', roles: ['student', 'institution_admin'] },
    { from: 'appealed', action: 'resolve_appeal', to: 'closed', roles: ['appeals_reviewer'], requiresEvidence: true, dualControl: true },
    { from: 'closed', action: 'apply_retention', to: 'retained', roles: ['privacy_officer'], dualControl: true },
  ],
  assess: (x) => ({ disposition: x.eventCount > 0 ? 'review_events' : 'no_recorded_events', identityStatus: x.identityProviderStatus, guilt: null }),
};
