const store = require('../data/store');
const { sendSuccess } = require('../utils/response');
const { classifyValue } = require('../utils/thresholdCheck');
const { average, round } = require('../utils/math');
const { parseLimit } = require('../validators/helpers');
const { validatePhysicalRecord } = require('../validators/recordValidators');
const recordService = require('../services/recordService');
const wellnessService = require('../services/wellnessService');

// POST /api/astronauts/:id/physical
function addPhysicalRecord(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const data = validatePhysicalRecord(req.body);
  const { record, alerts } = recordService.addPhysicalRecord(astronaut.id, data);

  return sendSuccess(res, { record, alerts }, { status: 201, message: 'Physical health data recorded' });
}

// GET /api/astronauts/:id/physical?limit=10
function getPhysicalRecords(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const limit = parseLimit(req.query.limit);
  const records = store.getRecords('physicalRecords', astronaut.id, limit);

  return sendSuccess(res, records, { meta: { count: records.length } });
}

// GET /api/astronauts/:id/physical/status
function getPhysicalStatus(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  return sendSuccess(res, { astronautId: astronaut.id, ...wellnessService.getPhysicalStatus(astronaut.id) });
}

// GET /api/astronauts/:id/physical/heart-rate?limit=30
function getHeartRateData(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const limit = parseLimit(req.query.limit);
  const records = store.getRecords('physicalRecords', astronaut.id, limit);

  if (records.length === 0) {
    return sendSuccess(res, { astronautId: astronaut.id, readings: [], stats: null });
  }

  const values = records.map((r) => r.heartRate);
  const latest = records[0].heartRate;

  return sendSuccess(res, {
    astronautId: astronaut.id,
    readings: records.map((r) => ({ recordedAt: r.recordedAt, heartRate: r.heartRate })),
    stats: {
      latest,
      average: round(average(values), 1),
      min: Math.min(...values),
      max: Math.max(...values),
      latestStatus: classifyValue(latest, store.thresholds.heartRate).severity,
    },
  });
}

module.exports = { addPhysicalRecord, getPhysicalRecords, getPhysicalStatus, getHeartRateData };