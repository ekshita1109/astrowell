const store = require('../data/store');
const alertService = require('./alertService');
const wellnessService = require('./wellnessService');
const { round, average } = require('../utils/math');

function buildSummary(astronaut) {
  const wellness = wellnessService.getWellnessSnapshot(astronaut.id);
  const sleep = store.getRecords('sleepRecords', astronaut.id, 1)[0];
  const mental = store.getRecords('mentalRecords', astronaut.id, 1)[0];
  const physical = store.getRecords('physicalRecords', astronaut.id, 1)[0];

  return {
    astronaut: {
      id: astronaut.id,
      name: astronaut.name,
      role: astronaut.role,
      mission: astronaut.mission,
      status: astronaut.status,
    },
    wellness,
    latestReadings: {
      sleepHours: sleep ? sleep.durationHours : null,
      sleepQuality: sleep ? sleep.quality : null,
      stressLevel: mental ? mental.stressLevel : null,
      mood: mental ? mental.mood : null,
      heartRate: physical ? physical.heartRate : null,
      oxygenSaturation: physical ? physical.oxygenSaturation : null,
      bodyTemperature: physical ? physical.bodyTemperature : null,
    },
  };
}

// Optional filters: wellnessStatus (e.g. critical), sort=score (lowest score first)
function getAstronautSummaries({ wellnessStatus, sort } = {}) {
  let summaries = store.astronauts.map(buildSummary);

  if (wellnessStatus) {
    summaries = summaries.filter((s) => s.wellness.overall.status === wellnessStatus);
  }
  if (sort === 'score') {
    summaries.sort((a, b) => (a.wellness.overall.score ?? 101) - (b.wellness.overall.score ?? 101));
  }
  return summaries;
}

function getAstronautDashboard(astronaut) {
  const id = astronaut.id;
  return {
    astronaut,
    wellness: wellnessService.getWellnessSnapshot(id),
    sleep: wellnessService.getSleepSummary(id),
    mental: wellnessService.getMentalSummary(id),
    physical: wellnessService.getPhysicalStatus(id),
    recentRecords: {
      sleep: store.getRecords('sleepRecords', id, 7),
      mental: store.getRecords('mentalRecords', id, 7),
      physical: store.getRecords('physicalRecords', id, 7),
    },
    openAlerts: store.alerts.filter((a) => a.astronautId === id && a.status !== 'resolved'),
  };
}

function getCrewStats() {
  const snapshots = store.astronauts.map((a) => ({
    astronaut: a,
    wellness: wellnessService.getWellnessSnapshot(a.id),
  }));

  const statusDistribution = { optimal: 0, stable: 0, needs_attention: 0, critical: 0, no_data: 0 };
  snapshots.forEach((s) => {
    statusDistribution[s.wellness.overall.status] += 1;
  });

  const avgScore = (pick) => {
    const values = snapshots.map(pick).filter((v) => v !== null && v !== undefined);
    const avg = average(values);
    return avg === null ? null : round(avg);
  };

  const overallScore = avgScore((s) => s.wellness.overall.score);

  const sleepSummaries = store.astronauts.map((a) => wellnessService.getSleepSummary(a.id)).filter((s) => s.hasData);
  const mentalSummaries = store.astronauts.map((a) => wellnessService.getMentalSummary(a.id)).filter((s) => s.hasData);
  const physicalSummaries = store.astronauts.map((a) => wellnessService.getPhysicalStatus(a.id)).filter((s) => s.hasData);

  const rounded = (values, decimals) => {
    const avg = average(values);
    return avg === null ? null : round(avg, decimals);
  };

  const byAstronautStatus = {};
  store.astronauts.forEach((a) => {
    byAstronautStatus[a.status] = (byAstronautStatus[a.status] || 0) + 1;
  });

  return {
    generatedAt: new Date().toISOString(),
    crewSize: store.astronauts.length,
    crewWellness: {
      score: overallScore,
      status: overallScore === null ? 'no_data' : wellnessService.statusFromScore(overallScore),
    },
    statusDistribution,
    averageScores: {
      overall: overallScore,
      sleep: avgScore((s) => s.wellness.components.sleep.score),
      mental: avgScore((s) => s.wellness.components.mental.score),
      physical: avgScore((s) => s.wellness.components.physical.score),
    },
    averages: {
      sleepHours: rounded(sleepSummaries.map((s) => s.averageDurationHours), 1),
      stressLevel: rounded(mentalSummaries.map((s) => s.averageStressLevel), 1),
      latestHeartRate: rounded(physicalSummaries.map((s) => s.latestReading.heartRate), 0),
    },
    astronautsByStatus: byAstronautStatus,
    alerts: alertService.getAlertSummary(),
    astronautsNeedingAttention: snapshots
      .filter((s) => ['needs_attention', 'critical'].includes(s.wellness.overall.status))
      .sort((a, b) => (a.wellness.overall.score ?? 0) - (b.wellness.overall.score ?? 0))
      .map((s) => ({
        id: s.astronaut.id,
        name: s.astronaut.name,
        score: s.wellness.overall.score,
        status: s.wellness.overall.status,
        activeAlerts: s.wellness.activeAlerts,
      })),
  };
}

module.exports = { getAstronautSummaries, getAstronautDashboard, getCrewStats };