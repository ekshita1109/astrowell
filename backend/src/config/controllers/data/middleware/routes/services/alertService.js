const store = require('../data/store');
const { classifyValue } = require('../utils/thresholdCheck');
const { PHYSICAL_METRICS } = require('../config/metrics');

// Returns an alert "candidate" if the value crosses a threshold, otherwise null.
function buildCandidate(record, { category, metric, label, unit, value, rule }) {
  const result = classifyValue(value, rule);
  if (result.severity === 'normal') return null;

  const astronaut = store.astronauts.find((a) => a.id === record.astronautId);
  const where = result.direction === 'low' ? 'below' : 'above';

  return {
    astronautId: record.astronautId,
    astronautName: astronaut ? astronaut.name : 'Unknown',
    category, // sleep | mental | physical
    metric,
    severity: result.severity, // warning | critical
    direction: result.direction,
    value,
    thresholdLimit: result.limit,
    sourceRecordId: record.id,
    message: `${label} of ${value}${unit} is ${where} the ${result.severity} limit of ${result.limit}${unit}`,
  };
}

// Creates new alerts. If the same astronaut already has an unresolved alert for the
// same metric and severity, that alert is updated instead (prevents alert spam).
function raiseAlerts(candidates) {
  const now = new Date().toISOString();

  return candidates.map((c) => {
    const existing = store.alerts.find(
      (a) =>
        a.astronautId === c.astronautId &&
        a.metric === c.metric &&
        a.severity === c.severity &&
        a.status !== 'resolved'
    );

    if (existing) {
      existing.occurrences += 1;
      existing.value = c.value;
      existing.message = c.message;
      existing.sourceRecordId = c.sourceRecordId;
      existing.updatedAt = now;
      return existing;
    }

    const alert = {
      id: store.nextId('ALT', 4),
      ...c,
      status: 'active', // active | acknowledged | resolved
      occurrences: 1,
      createdAt: now,
      updatedAt: now,
      acknowledgedAt: null,
      resolvedAt: null,
      handledBy: null,
    };
    store.alerts.push(alert);
    return alert;
  });
}

function evaluateSleepRecord(record) {
  const candidate = buildCandidate(record, {
    category: 'sleep',
    metric: 'sleepDuration',
    label: 'Sleep duration',
    unit: ' hours',
    value: record.durationHours,
    rule: store.thresholds.sleepDuration,
  });
  return raiseAlerts([candidate].filter(Boolean));
}

function evaluateMentalRecord(record) {
  const t = store.thresholds;
  const candidates = [
    buildCandidate(record, {
      category: 'mental',
      metric: 'stressLevel',
      label: 'Stress level',
      unit: '/10',
      value: record.stressLevel,
      rule: t.stressLevel,
    }),
    buildCandidate(record, {
      category: 'mental',
      metric: 'moodScore',
      label: `Mood score (${record.mood})`,
      unit: '/5',
      value: record.moodScore,
      rule: t.moodScore,
    }),
  ].filter(Boolean);
  return raiseAlerts(candidates);
}

function evaluatePhysicalRecord(record) {
  const candidates = PHYSICAL_METRICS.filter((m) => record[m.field] !== null && record[m.field] !== undefined)
    .map((m) =>
      buildCandidate(record, {
        category: 'physical',
        metric: m.field,
        label: m.label,
        unit: m.unit,
        value: record[m.field],
        rule: store.thresholds[m.thresholdKey],
      })
    )
    .filter(Boolean);
  return raiseAlerts(candidates);
}

function getAlertSummary() {
  const count = (key, initial) =>
    store.alerts.reduce((acc, a) => {
      acc[a[key]] = (acc[a[key]] || 0) + 1;
      return acc;
    }, { ...initial });

  return {
    total: store.alerts.length,
    activeCritical: store.alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length,
    byStatus: count('status', { active: 0, acknowledged: 0, resolved: 0 }),
    bySeverity: count('severity', { warning: 0, critical: 0 }),
    byCategory: count('category', { sleep: 0, mental: 0, physical: 0 }),
  };
}

module.exports = {
  evaluateSleepRecord,
  evaluateMentalRecord,
  evaluatePhysicalRecord,
  getAlertSummary,
};