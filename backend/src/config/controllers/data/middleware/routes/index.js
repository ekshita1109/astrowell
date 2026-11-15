const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', uptimeSeconds: Math.round(process.uptime()), timestamp: new Date().toISOString() },
  });
});

// Nested routes (they read the astronaut id from :id)
router.use('/astronauts/:id/sleep', require('./sleepRoutes'));
router.use('/astronauts/:id/mental', require('./mentalRoutes'));
router.use('/astronauts/:id/physical', require('./physicalRoutes'));

router.use('/astronauts', require('./astronautRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/thresholds', require('./thresholdRoutes'));

module.exports = router;