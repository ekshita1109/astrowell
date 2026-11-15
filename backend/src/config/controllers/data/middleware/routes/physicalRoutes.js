const express = require('express');
const controller = require('../controllers/physicalController');

const router = express.Router({ mergeParams: true });

router.route('/').get(controller.getPhysicalRecords).post(controller.addPhysicalRecord);
router.get('/status', controller.getPhysicalStatus);
router.get('/heart-rate', controller.getHeartRateData);

module.exports = router;