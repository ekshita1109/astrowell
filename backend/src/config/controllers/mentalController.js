const store = require('../data/store');
const { sendSuccess } = require('../utils/response');
const { parseLimit } = require('../validators/helpers');
const { validateMentalRecord } = require('../validators/recordValidators');
const recordService = require('../services/recordService');
const wellnessService = require('../services/wellnessService');

// POST /api/astronauts/:id/mental
function addMentalRecord(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const data = validateMentalRecord(req.body);
  const { record, alerts } = recordService.addMentalRecord(astronaut.id, data);

  return sendSuccess(res, { record, alerts }, { status: 201, message: 'Mental wellness data recorded' });
}

// GET /api/astronauts/:id/mental?limit=10
function getMentalRecords(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const limit = parseLimit(req.query.limit);
  const records = store.getRecords('mentalRecords', astronaut.id, limit);

  return sendSuccess(res, records, { meta: { count: records.length } });
}

// GET /api/astronauts/:id/mental/status
function getMentalStatus(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  return sendSuccess(res, { astronautId: astronaut.id, ...wellnessService.getMentalSummary(astronaut.id) });
}

module.exports = { addMentalRecord, getMentalRecords, getMentalStatus };