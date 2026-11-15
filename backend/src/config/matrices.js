// Physical indicators we monitor. Shared by the alert and wellness services.
// "field" = property name on a physical record, "thresholdKey" = key in thresholds.
const PHYSICAL_METRICS = [
  { field: 'heartRate', thresholdKey: 'heartRate', label: 'Heart rate', unit: ' bpm' },
  { field: 'systolicBP', thresholdKey: 'systolicBP', label: 'Systolic blood pressure', unit: ' mmHg' },
  { field: 'diastolicBP', thresholdKey: 'diastolicBP', label: 'Diastolic blood pressure', unit: ' mmHg' },
  { field: 'bodyTemperature', thresholdKey: 'bodyTemperature', label: 'Body temperature', unit: ' °C' },
  { field: 'oxygenSaturation', thresholdKey: 'oxygenSaturation', label: 'Oxygen saturation', unit: '%' },
];

module.exports = { PHYSICAL_METRICS };