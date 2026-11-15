const store = require('../data/store');
const { classifyValue } = require('../utils/thresholdCheck');
const { PHYSICAL_METRICS } = require('../config/metrics');
const { round, average, clamp } = require('../utils/math');

const SLEEP_WINDOW = 7; // nights used for the sleep summary
const MENTAL_WINDOW = 5; // latest check-ins used for the mental summary
const TARGET_SLEEP_HOURS = 7.5;
const PENALTY = { normal: 0, warning: 25, critical: 60 }; // physical score deductions

function statusFromScore(score) {
  if (score >= 80) return 'optimal';
  if (score >= 60) return 'stable';
  if (score >= 40) return 'needs_attention';
  return 'critical';
}

function sleepQualityLabel(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

// Scores one night of sleep (0-100) from its duration and number of interruptions.
function rateSleep(durationHours, interruptions = 0) {
  let score;
  if (durationHours >= 7 && durationHours <= 9) score = 100;
  else if (durationHours >= 6 && durationHours < 7) score = 80;
  else if (durationHours > 9 && durationHours <= 10) score = 80;
  else if (durationHours >= 5 && durationHours < 6) score = 60;
  else if (durationHours > 10) score = 60;
  else if (durationHours >= 4) score = 40;
  else score = 20;

  score = Math.max(0, score - Math.min(interruptions * 5, 25));
  return { score, label: sleepQualityLabel(score) };
}

const SLEEP_ADVICE = {
  excellent: 'Sleep is healthy. Keep the current sleep schedule.',
  good: 'Sleep is adequate. Protect the regular sleep window.',
  fair: 'Sleep is slightly low. Review the schedule, light exposure and noise in the sleeping quarters.',
  poor: 'Sleep is critically low. Schedule rest time and inform the flight surgeon.',
};

const MENTAL_ADVICE = {
  optimal: 'Mental wellness is strong. Continue routine check-ins.',
  stable: 'Mental wellness is stable. Keep up exercise, social contact and routine check-ins.',
  needs_attention: 'Elevated stress or low mood. Suggest a private call with ground support or the crew psychologist.',
  critical: 'Severe stress or low mood. Arrange an urgent psychological support session.',
};

function getSleepSummary(astronautId) {
  const records = store.getRecords('sleepRecords', astronautId, SLEEP_WINDOW);
  if (records.length === 0) return { hasData: false, message: 'No sleep data recorded yet' };

  const avgDuration = average(records.map((r) => r.durationHours));
  const avgScore = average(records.map((r) => r.qualityScore));
  const quality = sleepQualityLabel(avgScore);
  const rule = store.thresholds.sleepDuration;

  return {
    hasData: true,
    nightsAnalyzed: records.length,
    averageDurationHours: round(avgDuration, 1),
    averageQualityScore: round(avgScore),
    quality,
    sleepDebtHours: round(
      records.reduce((sum, r) => sum + Math.max(0, TARGET_SLEEP_HOURS - r.durationHours), 0),
      1
    ),
    nightsBelowThreshold: records.filter((r) => r.durationHours < rule.lowWarning).length,
    latestNight: records[0],
    recommendation: SLEEP_ADVICE[quality],
  };
}

function getMentalSummary(astronautId) {
  const records = store.getRecords('mentalRecords', astronautId, MENTAL_WINDOW);
  if (records.length === 0) return { hasData: false, message: 'No mental wellness data recorded yet' };

  const avgStress = average(records.map((r) => r.stressLevel));
  const avgMood = average(records.map((r) => r.moodScore));

  const stressPart = clamp(100 - (avgStress - 1) * 8, 0, 100); // stress 1 -> 100, stress 10 -> 28
  const moodPart = avgMood * 20; // mood 1 -> 20, mood 5 -> 100
  const score = round((stressPart + moodPart) / 2);
  const status = statusFromScore(score);

  const moodCounts = {};
  records.forEach((r) => {
    moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
  });
  const dominantMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];

  return {
    hasData: true,
    recordsAnalyzed: records.length,
    averageStressLevel: round(avgStress, 1),
    averageMoodScore: round(avgMood, 1),
    dominantMood,
    score,
    status,
    latestCheckIn: records[0],
    recommendation: MENTAL_ADVICE[status],
  };
}

function getPhysicalStatus(astronautId) {
  const latest = store.getRecords('physicalRecords', astronautId, 1)[0];
  if (!latest) return { hasData: false, message: 'No physical health data recorded yet' };

  const indicators = {};
  const abnormalIndicators = [];
  let penalty = 0;

  PHYSICAL_METRICS.forEach((m) => {
    const value = latest[m.field];
    if (value === null || value === undefined) return;

    const result = classifyValue(value, store.thresholds[m.thresholdKey]);
    indicators[m.field] = {
      label: m.label,
      value,
      unit: m.unit.trim(),
      severity: result.severity,
    };
    penalty += PENALTY[result.severity];
    if (result.severity !== 'normal') abnormalIndicators.push(m.field);
  });

  const score = clamp(100 - penalty, 0, 100);
  return {
    hasData: true,
    score,
    status: statusFromScore(score),
    recordedAt: latest.recordedAt,
    indicators,
    abnormalIndicators,
    latestReading: latest,
  };
}

// Combines sleep, mental and physical into one overall picture.
function getWellnessSnapshot(astronautId) {
  const sleep = getSleepSummary(astronautId);
  const mental = getMentalSummary(astronautId);
  const physical = getPhysicalStatus(astronautId);

  const parts = [
    { score: sleep.hasData ? sleep.averageQualityScore : null, weight: 0.3 },
    { score: mental.hasData ? mental.score : null, weight: 0.35 },
    { score: physical.hasData ? physical.score : null, weight: 0.35 },
  ].filter((p) => p.score !== null);

  let overallScore = null;
  let status = 'no_data';
  if (parts.length > 0) {
    const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
    overallScore = round(parts.reduce((sum, p) => sum + p.score * p.weight, 0) / totalWeight);
    status = statusFromScore(overallScore);
  }

  const activeAlerts = store.alerts.filter((a) => a.astronautId === astronautId && a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical').length;
  if (criticalAlerts > 0) status = 'critical'; // an open critical alert always wins

  const timestamps = [
    sleep.hasData ? sleep.latestNight.recordedAt : null,
    mental.hasData ? mental.latestCheckIn.recordedAt : null,
    physical.hasData ? physical.recordedAt : null,
  ].filter(Boolean);

  return {
    astronautId,
    overall: { score: overallScore, status },
    components: {
      sleep: { score: sleep.hasData ? sleep.averageQualityScore : null, label: sleep.hasData ? sleep.quality : null },
      mental: { score: mental.hasData ? mental.score : null, label: mental.hasData ? mental.status : null },
      physical: { score: physical.hasData ? physical.score : null, label: physical.hasData ? physical.status : null },
    },
    activeAlerts: activeAlerts.length,
    criticalAlerts,
    lastUpdated: timestamps.length ? timestamps.sort().reverse()[0] : null,
  };
}

module.exports = {
  statusFromScore,
  rateSleep,
  getSleepSummary,
  getMentalSummary,
  getPhysicalStatus,
  getWellnessSnapshot,
};