const store = require('../data/store');
const { sendSuccess } = require('../utils/response');
const { parseLimit } = require('../validators/helpers');
const { validateSleepRecord } = require('../validators/recordValidators');
const recordService = require('../services/recordService');
const wellnessService = require('../services/wellnessService');

// POST /api/astronauts/:id/sleep
function addSleepRecord(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const data = validateSleepRecord(req.body);
  const { record, alerts } = recordService.addSleepRecord(astronaut.id, data);

  return sendSuccess(res, { record, alerts }, { status: 201, message: 'Sleep data recorded' });
}

// GET /api/astronauts/:id/sleep?limit=14
function getSleepRecords(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const limit = parseLimit(req.query.limit);
  const records = store.getRecords('sleepRecords', astronaut.id, limit);

  return sendSuccess(res, records, { meta: { count: records.length } });
}

// GET /api/astronauts/:id/sleep/quality
function getSleepQuality(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  return sendSuccess(res, { astronautId: astronaut.id, ...wellnessService.getSleepSummary(astronaut.id) });
}

module.exports = { addSleepRecord, getSleepRecords, getSleepQuality };