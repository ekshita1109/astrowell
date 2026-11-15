const express = require('express');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summaries', controller.getSummaries);
router.get('/crew-stats', controller.getCrewStats);
router.get('/astronauts/:id', controller.getAstronautDashboard);

module.exports = router;