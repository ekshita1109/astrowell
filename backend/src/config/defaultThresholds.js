// Default alert thresholds. They can be changed at runtime via PUT /api/thresholds.
// Rules (strict comparison):
//   value < lowWarning   -> warning      value < lowCritical   -> critical
//   value > highWarning  -> warning      value > highCritical  -> critical
// NOTE: demo values only, not medical advice.
module.exports = {
  sleepDuration: { lowCritical: 4.5, lowWarning: 6, highWarning: 10 }, // hours
  stressLevel: { highWarning: 6, highCritical: 8 }, // scale 1-10
  moodScore: { lowCritical: 2, lowWarning: 3 }, // scale 1-5 (see moods.js)
  heartRate: { lowCritical: 40, lowWarning: 50, highWarning: 100, highCritical: 130 }, // bpm
  systolicBP: { lowCritical: 70, lowWarning: 90, highWarning: 140, highCritical: 180 }, // mmHg
  diastolicBP: { lowCritical: 40, lowWarning: 60, highWarning: 90, highCritical: 120 }, // mmHg
  bodyTemperature: { lowCritical: 35, lowWarning: 36, highWarning: 37.8, highCritical: 39 }, // Celsius
  oxygenSaturation: { lowCritical: 90, lowWarning: 94 }, // percent
};