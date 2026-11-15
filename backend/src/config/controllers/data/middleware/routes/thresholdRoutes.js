const express = require('express');
const controller = require('../controllers/thresholdController');

const router = express.Router();

router.route('/').get(controller.getThresholds).put(controller.updateThresholds);
router.post('/reset', controller.resetThresholds);

module.exports = router;