const AppError = require('../utils/AppError');
const { MOOD_SCORES } = require('../config/moods');
const { validateAgainstSchema } = require('./helpers');

const nowIso = () => new Date().toISOString();

const sleepSchema = {
  durationHours: { type: 'number', required: true, min: 0, max: 24 },
  interruptions: { type: 'integer', min: 0, max: 30, default: 0 },
  notes: { type: 'string', max: 500 },
  recordedAt: { type: 'date', noFuture: true, default: nowIso },
};

const mentalSchema = {
  stressLevel: { type: 'integer', required: true, min: 1, max: 10 },
  mood: { type: 'enum', required: true, allowed: Object.keys(MOOD_SCORES) },
  notes: { type: 'string', max: 500 },
  recordedAt: { type: 'date', noFuture: true, default: nowIso },
};

const physicalSchema = {
  heartRate: { type: 'integer', required: true, min: 20, max: 250 },
  systolicBP: { type: 'integer', min: 50, max: 260 },
  diastolicBP: { type: 'integer', min: 30, max: 160 },
  bodyTemperature: { type: 'number', min: 30, max: 43 },
  oxygenSaturation: { type: 'number', min: 50, max: 100 },
  notes: { type: 'string', max: 500 },
  recordedAt: { type: 'date', noFuture: true, default: nowIso },
};

const validateSleepRecord = (body) => validateAgainstSchema(body, sleepSchema);
const validateMentalRecord = (body) => validateAgainstSchema(body, mentalSchema);

function validatePhysicalRecord(body) {
  const clean = validateAgainstSchema(body, physicalSchema);
  const hasSys = clean.systolicBP !== undefined;
  const hasDia = clean.diastolicBP !== undefined;

  if (hasSys !== hasDia) {
    throw new AppError('Validation failed', 400, [
      { field: 'bloodPressure', message: 'systolicBP and diastolicBP must be sent together' },
    ]);
  }
  if (hasSys && clean.systolicBP <= clean.diastolicBP) {
    throw new AppError('Validation failed', 400, [
      { field: 'systolicBP', message: 'systolicBP must be greater than diastolicBP' },
    ]);
  }
  return clean;
}

module.exports = { validateSleepRecord, validateMentalRecord, validatePhysicalRecord };