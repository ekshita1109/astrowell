const store = require('../data/store');
const { sendSuccess } = require('../utils/response');
const { validateThresholdUpdate } = require('../validators/thresholdValidator');

// GET /api/thresholds
function getThresholds(req, res) {
  return sendSuccess(res, store.thresholds);
}

// PUT /api/thresholds  body: { "heartRate": { "highWarning": 95 } }
function updateThresholds(req, res) {
  store.thresholds = validateThresholdUpdate(req.body);
  return sendSuccess(res, store.thresholds, {
    message: 'Thresholds updated. They apply to newly submitted data.',
  });
}

// POST /api/thresholds/reset
function resetThresholds(req, res) {
  store.resetThresholds();
  return sendSuccess(res, store.thresholds, { message: 'Thresholds reset to defaults' });
}

module.exports = { getThresholds, updateThresholds, resetThresholds };