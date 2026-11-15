// Entry point: loads demo data and starts the HTTP server.
const app = require('./src/app');
const seedData = require('./src/data/seed');

const PORT = process.env.PORT || 4000;

seedData();

app.listen(PORT, () => {
  console.log(`AstroWell backend running at http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/health`);
});