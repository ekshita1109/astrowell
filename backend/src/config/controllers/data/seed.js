// Loads realistic (fictional) crew data so the API has something to show.
// Each array holds 7 values: index 0 = 6 days ago ... index 6 = today.
const store = require('./store');
const recordService = require('../services/recordService');

function timestamp(daysBack, hourUtc) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  d.setUTCHours(hourUtc, 0, 0, 0);
  // Never create a timestamp in the future
  return d > new Date() ? new Date(Date.now() - 60000).toISOString() : d.toISOString();
}

const oneDecimal = (n) => Number(n.toFixed(1));

const crew = [
  {
    profile: {
      name: 'Elena Vasquez', age: 45, gender: 'female', nationality: 'Spanish',
      role: 'Mission Commander', mission: 'Lunar Gateway Expedition 1', status: 'active',
      heightCm: 170, weightKg: 64, bloodType: 'O+',
    },
    sleep: [[7.5, 0], [7.2, 1], [7.8, 0], [7.0, 0], [7.4, 1], [7.6, 0], [7.3, 0]],
    stress: [3, 3, 4, 3, 2, 3, 3],
    moods: ['calm', 'calm', 'happy', 'calm', 'calm', 'happy', 'calm'],
    heartRate: [62, 64, 61, 63, 60, 62, 63],
    vitals: { systolicBP: 116, diastolicBP: 74, bodyTemperature: 36.6, oxygenSaturation: 98 },
  },
  {
    profile: {
      name: 'Amara Okafor', age: 38, gender: 'female', nationality: 'Nigerian',
      role: 'Flight Surgeon', mission: 'Lunar Gateway Expedition 1', status: 'active',
      heightCm: 165, weightKg: 58, bloodType: 'A+',
    },
    sleep: [[6.8, 1], [7.1, 0], [6.5, 1], [7.0, 0], [6.9, 1], [7.2, 0], [6.7, 1]],
    stress: [4, 4, 5, 4, 4, 3, 4],
    moods: ['calm', 'neutral', 'calm', 'neutral', 'calm', 'calm', 'neutral'],
    heartRate: [66, 68, 70, 67, 65, 66, 68],
    vitals: { systolicBP: 112, diastolicBP: 72, bodyTemperature: 36.7, oxygenSaturation: 98 },
  },
  {
    // Sleep-deprived and increasingly stressed: will trigger warning + critical alerts
    profile: {
      name: 'Kenji Tanaka', age: 41, gender: 'male', nationality: 'Japanese',
      role: 'Flight Engineer', mission: 'Lunar Gateway Expedition 1', status: 'active',
      heightCm: 175, weightKg: 71, bloodType: 'B+',
    },
    sleep: [[6.2, 1], [5.8, 2], [5.5, 2], [5.1, 3], [4.8, 3], [4.4, 4], [4.2, 4]],
    stress: [5, 6, 6, 7, 8, 8, 9],
    moods: ['neutral', 'tired', 'tired', 'anxious', 'anxious', 'irritable', 'anxious'],
    heartRate: [74, 76, 78, 82, 86, 90, 95],
    vitals: { systolicBP: 126, diastolicBP: 82, bodyTemperature: 36.9, oxygenSaturation: 95 },
  },
  {
    // Rising heart rate: will trigger heart rate warnings
    profile: {
      name: 'Priya Nair', age: 34, gender: 'female', nationality: 'Indian',
      role: 'Mission Specialist', mission: 'Lunar Gateway Expedition 1', status: 'active',
      heightCm: 162, weightKg: 55, bloodType: 'AB+',
    },
    sleep: [[7.0, 0], [6.6, 1], [7.4, 0], [6.9, 1], [7.1, 0], [6.4, 1], [6.8, 1]],
    stress: [4, 5, 5, 6, 6, 7, 7],
    moods: ['calm', 'neutral', 'neutral', 'tired', 'anxious', 'neutral', 'anxious'],
    heartRate: [72, 74, 78, 86, 101, 104, 108],
    vitals: { systolicBP: 118, diastolicBP: 76, bodyTemperature: 36.8, oxygenSaturation: 96 },
  },
  {
    profile: {
      name: 'Lars Eriksson', age: 49, gender: 'male', nationality: 'Swedish',
      role: 'Payload Specialist', mission: 'Lunar Gateway Expedition 1', status: 'active',
      heightCm: 182, weightKg: 79, bloodType: 'A-',
    },
    sleep: [[8.0, 0], [7.6, 0], [8.2, 0], [7.9, 1], [7.5, 0], [8.1, 0], [7.8, 0]],
    stress: [2, 3, 2, 3, 2, 3, 2],
    moods: ['happy', 'happy', 'calm', 'happy', 'calm', 'happy', 'happy'],
    heartRate: [58, 60, 59, 61, 57, 60, 59],
    vitals: { systolicBP: 120, diastolicBP: 78, bodyTemperature: 36.5, oxygenSaturation: 98 },
  },
];

function seedData() {
  crew.forEach((member) => {
    const now = new Date().toISOString();
    const astronaut = { id: store.nextId('AST'), ...member.profile, createdAt: now, updatedAt: now };
    store.astronauts.push(astronaut);

    // Oldest to newest, so alerts build up in a natural order
    for (let i = 0; i < 7; i += 1) {
      const daysBack = 6 - i;

      recordService.addSleepRecord(astronaut.id, {
        durationHours: member.sleep[i][0],
        interruptions: member.sleep[i][1],
        recordedAt: timestamp(daysBack, 7),
      });

      recordService.addMentalRecord(astronaut.id, {
        stressLevel: member.stress[i],
        mood: member.moods[i],
        recordedAt: timestamp(daysBack, 20),
      });

      const v = member.vitals;
      recordService.addPhysicalRecord(astronaut.id, {
        heartRate: member.heartRate[i],
        systolicBP: v.systolicBP + ((i * 4) % 7) - 3,
        diastolicBP: v.diastolicBP + ((i * 3) % 5) - 2,
        bodyTemperature: oneDecimal(v.bodyTemperature + ((i % 3) - 1) * 0.1),
        oxygenSaturation: Math.min(100, v.oxygenSaturation + (i % 2)),
        recordedAt: timestamp(daysBack, 12),
      });
    }
  });

  console.log(
    `Sample data loaded: ${store.astronauts.length} astronauts, ` +
      `${store.sleepRecords.length} sleep, ${store.mentalRecords.length} mental, ` +
      `${store.physicalRecords.length} physical records, ${store.alerts.length} alerts`
  );
}

module.exports = seedData;