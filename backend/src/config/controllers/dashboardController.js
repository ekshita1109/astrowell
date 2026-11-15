const store = require('../data/store');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const dashboardService = require('../services/dashboardService');

const WELLNESS_STATUSES = ['optimal', 'stable', 'needs_attention', 'critical', 'no_data'];

// GET /api/dashboard/summaries?wellnessStatus=critical&sort=score
function getSummaries(req, res) {
  const { wellnessStatus, sort } = req.query;

  if (wellnessStatus && !WELLNESS_STATUSES.includes(wellnessStatus)) {
    throw new AppError(`wellnessStatus must be one of: ${WELLNESS_STATUSES.join(', ')}`, 400);
  }
  if (sort && sort !== 'score') {
    throw new AppError("sort can only be 'score'", 400);
  }

  const summaries = dashboardService.getAstronautSummaries({ wellnessStatus, sort });
  return sendSuccess(res, summaries, { meta: { count: summaries.length } });
}

// GET /api/dashboard/astronauts/:id
function getAstronautDashboard(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  return sendSuccess(res, dashboardService.getAstronautDashboard(astronaut));
}

// GET /api/dashboard/crew-stats
function getCrewStats(req, res) {
  return sendSuccess(res, dashboardService.getCrewStats());
}

module.exports = { getSummaries, getAstronautDashboard, getCrewStats };