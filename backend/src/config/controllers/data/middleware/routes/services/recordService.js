// Creates sleep / mental / physical records and runs the alert checks.
// Used by both the controllers and the seed script.
const store = require('../data/store');
const { MOOD_SCORES } = require('../config/moods');
const alertService = require('./alertService');
const wellnessService = require('./wellnessService');

function addSleepRecord(astronautId, data) {
  const interruptions = data.interruptions ?? 0;
  const rating = wellnessService.rateSleep(data.durationHours, interruptions);

  const record = {
    id: store.nextId('SLP', 4),
    astronautId,
    durationHours: data.durationHours,
    interruptions,
    notes: data.notes ?? null,
    recordedAt: data.recordedAt,
    date: data.recordedAt.slice(0, 10),
    qualityScore: rating.score,
    quality: rating.label,
    createdAt: new Date().toISOString(),
  };

  store.sleepRecords.push(record);
  const alerts = alertService.evaluateSleepRecord(record);
  return { record, alerts };
}

function addMentalRecord(astronautId, data) {
  const record = {
    id: store.nextId('MNT', 4),
    astronautId,
    stressLevel: data.stressLevel,
    mood: data.mood,
    moodScore: MOOD_SCORES[data.mood],
    notes: data.notes ?? null,
    recordedAt: data.recordedAt,
    createdAt: new Date().toISOString(),
  };

  store.mentalRecords.push(record);
  const alerts = alertService.evaluateMentalRecord(record);
  return { record, alerts };
}

function addPhysicalRecord(astronautId, data) {
  const record = {
    id: store.nextId('PHY', 4),
    astronautId,
    heartRate: data.heartRate,
    systolicBP: data.systolicBP ?? null,
    diastolicBP: data.diastolicBP ?? null,
    bodyTemperature: data.bodyTemperature ?? null,
    oxygenSaturation: data.oxygenSaturation ?? null,
    notes: data.notes ?? null,
    recordedAt: data.recordedAt,
    createdAt: new Date().toISOString(),
  };

  store.physicalRecords.push(record);
  const alerts = alertService.evaluatePhysicalRecord(record);
  return { record, alerts };
}

module.exports = { addSleepRecord, addMentalRecord, addPhysicalRecord };