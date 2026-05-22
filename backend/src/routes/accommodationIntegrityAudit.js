const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({
  success: true,
  data: {
    summary: { accommodated_sessions: 32, rule_conflicts: 5, appeals_prevented: 4, reviewer_queue: 7 },
    sessions: [
      { session: 'EX-8821', accommodation: 'extended time', conflict: 'timer mismatch', action: 'adjust session record' },
      { session: 'EX-8844', accommodation: 'screen reader', conflict: 'browser lock alert', action: 'mark permitted tool' },
      { session: 'EX-8890', accommodation: 'break allowance', conflict: 'absence flag', action: 'review break log' },
    ],
  },
}));

module.exports = router;
