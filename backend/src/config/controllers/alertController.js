const store = require('../data/store');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { validateAgainstSchema, parseLimit } = require('../validators/helpers');
const alertService = require('../services/alertService');

const ALLOWED = {
  status: ['active', 'acknowledged', 'resolved'],
  severity: ['warning', 'critical'],
  category: ['sleep', 'mental', 'physical'],
};

function enumFilter(query, name) {
  const value = query[name];
  if (value === undefined) return undefined;
  const lower = String(value).toLowerCase();
  if (!ALLOWED[name].includes(lower)) {
    throw new AppError(`Invalid ${name}. Allowed values: ${ALLOWED[name].join(', ')}`, 400);
  }
  return lower;
}

// Shared by GET /api/alerts and GET /api/astronauts/:id/alerts
function queryAlerts(query, forcedAstronautId) {
  const status = enumFilter(query, 'status');
  const severity = enumFilter(query, 'severity');
  const category = enumFilter(query, 'category');
  const limit = parseLimit(query.limit, 50);

  let alerts = [...store.alerts];

  const astronautId = forcedAstronautId || (query.astronautId ? store.findAstronautOrFail(query.astronautId).id : null);
  if (astronautId) alerts = alerts.filter((a) => a.astronautId === astronautId);
  if (status) alerts = alerts.filter((a) => a.status === status);
  if (severity) alerts = alerts.filter((a) => a.severity === severity);
  if (category) alerts = alerts.filter((a) => a.category === category);

  alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { total: alerts.length, alerts: alerts.slice(0, limit) };
}

// GET /api/alerts?status=active&severity=critical&category=sleep&astronautId=AST-003&limit=20
function listAlerts(req, res) {
  const { total, alerts } = queryAlerts(req.query);
  return sendSuccess(res, alerts, { meta: { count: alerts.length, total } });
}

// GET /api/astronauts/:id/alerts
function listAstronautAlerts(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const { total, alerts } = queryAlerts(req.query, astronaut.id);
  return sendSuccess(res, alerts, { meta: { count: alerts.length, total } });
}

// GET /api/alerts/summary
function getAlertSummary(req, res) {
  return sendSuccess(res, alertService.getAlertSummary());
}

function findAlertOrFail(id) {
  const alert = store.alerts.find((a) => a.id.toUpperCase() === String(id).toUpperCase());
  if (!alert) throw new AppError(`Alert with id '${id}' not found`, 404);
  return alert;
}

// GET /api/alerts/:alertId
function getAlert(req, res) {
  return sendSuccess(res, findAlertOrFail(req.params.alertId));
}

// PATCH /api/alerts/:alertId/status   body: { "status": "acknowledged", "handledBy": "Dr. Amara Okafor" }
function updateAlertStatus(req, res) {
  const alert = findAlertOrFail(req.params.alertId);
  const { status, handledBy } = validateAgainstSchema(req.body, {
    status: { type: 'enum', required: true, allowed: ALLOWED.status },
    handledBy: { type: 'string', max: 100 },
  });

  const now = new Date().toISOString();
  alert.status = status;
  alert.updatedAt = now;
  if (handledBy) alert.handledBy = handledBy;

  if (status === 'acknowledged') {
    alert.acknowledgedAt = now;
    alert.resolvedAt = null;
  } else if (status === 'resolved') {
    alert.acknowledgedAt = alert.acknowledgedAt || now;
    alert.resolvedAt = now;
  } else {
    alert.acknowledgedAt = null;
    alert.resolvedAt = null;
  }

  return sendSuccess(res, alert, { message: `Alert marked as ${status}` });
}

module.exports = { listAlerts, listAstronautAlerts, getAlertSummary, getAlert, updateAlertStatus };