const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors()); // allows any frontend origin (fine for a hackathon demo)
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({
    name: 'AstroWell API',
    version: '1.0.0',
    description: 'Astronaut wellness monitoring backend',
    baseUrl: '/api',
    endpoints: [
      'GET    /api/health',
      'GET    /api/astronauts',
      'POST   /api/astronauts',
      'GET    /api/astronauts/:id',
      'PUT    /api/astronauts/:id',
      'GET    /api/astronauts/:id/sleep',
      'POST   /api/astronauts/:id/sleep',
      'GET    /api/astronauts/:id/sleep/quality',
      'GET    /api/astronauts/:id/mental',
      'POST   /api/astronauts/:id/mental',
      'GET    /api/astronauts/:id/mental/status',
      'GET    /api/astronauts/:id/physical',
      'POST   /api/astronauts/:id/physical',
      'GET    /api/astronauts/:id/physical/status',
      'GET    /api/astronauts/:id/physical/heart-rate',
      'GET    /api/astronauts/:id/alerts',
      'GET    /api/dashboard/summaries',
      'GET    /api/dashboard/crew-stats',
      'GET    /api/dashboard/astronauts/:id',
      'GET    /api/alerts',
      'GET    /api/alerts/summary',
      'GET    /api/alerts/:alertId',
      'PATCH  /api/alerts/:alertId/status',
      'GET    /api/thresholds',
      'PUT    /api/thresholds',
      'POST   /api/thresholds/reset',
    ],
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;