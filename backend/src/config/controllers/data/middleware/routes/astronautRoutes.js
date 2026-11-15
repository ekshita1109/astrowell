const express = require('express');
const controller = require('../controllers/astronautController');
const alertController = require('../controllers/alertController');

const router = express.Router();

router.route('/').get(controller.listAstronauts).post(controller.createAstronaut);
router.route('/:id').get(controller.getAstronaut).put(controller.updateAstronaut).patch(controller.updateAstronaut);
router.get('/:id/alerts', alertController.listAstronautAlerts);

module.exports = router;