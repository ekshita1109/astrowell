// In-memory "database". Data is lost when the server restarts (no real database used).
const AppError = require('../utils/AppError');
const defaultThresholds = require('../config/defaultThresholds');

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const store = {
  astronauts: [],
  sleepRecords: [],
  mentalRecords: [],
  physicalRecords: [],
  alerts: [],
  thresholds: clone(defaultThresholds), // always read as store.thresholds (it can be replaced)
};

const counters = {};

// Creates ids like AST-001, SLP-0001
store.nextId = function nextId(prefix, pad = 3) {
  counters[prefix] = (counters[prefix] || 0) + 1;
  return `${prefix}-${String(counters[prefix]).padStart(pad, '0')}`;
};

store.findAstronautOrFail = function findAstronautOrFail(id) {
  const astronaut = store.astronauts.find(
    (a) => a.id.toUpperCase() === String(id).toUpperCase()
  );
  if (!astronaut) throw new AppError(`Astronaut with id '${id}' not found`, 404);
  return astronaut;
};

// Records of one astronaut, newest first. collection = 'sleepRecords' | 'mentalRecords' | 'physicalRecords'
store.getRecords = function getRecords(collection, astronautId, limit) {
  const list = store[collection]
    .filter((r) => r.astronautId === astronautId)
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  return limit ? list.slice(0, limit) : list;
};

store.resetThresholds = function resetThresholds() {
  store.thresholds = clone(defaultThresholds);
};

module.exports = store;