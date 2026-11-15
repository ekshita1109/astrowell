const express = require('express');
const controller = require('../controllers/sleepController');

const router = express.Router({ mergeParams: true });

router.route('/').get(controller.getSleepRecords).post(controller.addSleepRecord);
router.get('/quality', controller.getSleepQuality);

module.exports = router;