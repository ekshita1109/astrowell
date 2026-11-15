const express = require('express');
const controller = require('../controllers/mentalController');

const router = express.Router({ mergeParams: true });

router.route('/').get(controller.getMentalRecords).post(controller.addMentalRecord);
router.get('/status', controller.getMentalStatus);

module.exports = router;