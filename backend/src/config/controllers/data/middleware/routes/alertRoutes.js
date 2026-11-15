const express = require('express');
const controller = require('../controllers/alertController');

const router = express.Router();

router.get('/', controller.listAlerts);
router.get('/summary', controller.getAlertSummary); // must be before '/:alertId'
router.get('/:alertId', controller.getAlert);
router.patch('/:alertId/status', controller.updateAlertStatus);

module.exports = router;