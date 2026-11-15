// Compares a value with a threshold rule and tells how serious it is.
// rule example: { lowCritical: 40, lowWarning: 50, highWarning: 100, highCritical: 130 }
function classifyValue(value, rule) {
  if (rule.lowCritical !== undefined && value < rule.lowCritical) {
    return { severity: 'critical', direction: 'low', limit: rule.lowCritical };
  }
  if (rule.highCritical !== undefined && value > rule.highCritical) {
    return { severity: 'critical', direction: 'high', limit: rule.highCritical };
  }
  if (rule.lowWarning !== undefined && value < rule.lowWarning) {
    return { severity: 'warning', direction: 'low', limit: rule.lowWarning };
  }
  if (rule.highWarning !== undefined && value > rule.highWarning) {
    return { severity: 'warning', direction: 'high', limit: rule.highWarning };
  }
  return { severity: 'normal', direction: null, limit: null };
}

module.exports = { classifyValue };