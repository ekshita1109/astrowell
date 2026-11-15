const AppError = require('../utils/AppError');
const store = require('../data/store');
const { assertBodyObject } = require('./helpers');

// Makes sure critical limits are "further out" than warning limits.
function checkOrder(group, rule, errors) {
  const { lowCritical: lc, lowWarning: lw, highWarning: hw, highCritical: hc } = rule;
  if (lc !== undefined && lw !== undefined && !(lc < lw)) {
    errors.push({ field: group, message: 'lowCritical must be less than lowWarning' });
  }
  if (hw !== undefined && hc !== undefined && !(hw < hc)) {
    errors.push({ field: group, message: 'highWarning must be less than highCritical' });
  }
  if (lw !== undefined && hw !== undefined && !(lw < hw)) {
    errors.push({ field: group, message: 'lowWarning must be less than highWarning' });
  }
}

// Body example: { "heartRate": { "highWarning": 95 }, "stressLevel": { "highCritical": 9 } }
// Returns the full merged thresholds object (nothing is saved here).
function validateThresholdUpdate(body) {
  assertBodyObject(body);
  const current = store.thresholds;
  const groups = Object.keys(body);

  if (groups.length === 0) {
    throw new AppError('Provide at least one threshold group to update', 400, {
      allowedGroups: Object.keys(current),
    });
  }

  const errors = [];
  const merged = JSON.parse(JSON.stringify(current));

  groups.forEach((group) => {
    if (!current[group]) {
      errors.push({
        field: group,
        message: `Unknown threshold group. Allowed: ${Object.keys(current).join(', ')}`,
      });
      return;
    }

    const rules = body[group];
    if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
      errors.push({ field: group, message: `${group} must be an object of threshold values` });
      return;
    }

    Object.entries(rules).forEach(([name, value]) => {
      if (!(name in current[group])) {
        errors.push({
          field: `${group}.${name}`,
          message: `Unknown field. Allowed: ${Object.keys(current[group]).join(', ')}`,
        });
      } else if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push({ field: `${group}.${name}`, message: 'must be a number' });
      } else {
        merged[group][name] = value;
      }
    });

    checkOrder(group, merged[group], errors);
  });

  if (errors.length) throw new AppError('Validation failed', 400, errors);
  return merged;
}

module.exports = { validateThresholdUpdate };