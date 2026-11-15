const store = require('../data/store');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const { validateCreateAstronaut, validateUpdateAstronaut } = require('../validators/astronautValidator');

// GET /api/astronauts?status=active&role=engineer&search=ken
function listAstronauts(req, res) {
  const { status, role, search } = req.query;
  let result = [...store.astronauts];

  if (status) result = result.filter((a) => a.status === String(status).toLowerCase());
  if (role) result = result.filter((a) => a.role.toLowerCase().includes(String(role).toLowerCase()));
  if (search) result = result.filter((a) => a.name.toLowerCase().includes(String(search).toLowerCase()));

  return sendSuccess(res, result, { meta: { count: result.length } });
}

// GET /api/astronauts/:id
function getAstronaut(req, res) {
  return sendSuccess(res, store.findAstronautOrFail(req.params.id));
}

// POST /api/astronauts
function createAstronaut(req, res) {
  const data = validateCreateAstronaut(req.body);

  const duplicate = store.astronauts.find(
    (a) => a.name.toLowerCase() === data.name.toLowerCase() && a.mission.toLowerCase() === data.mission.toLowerCase()
  );
  if (duplicate) {
    throw new AppError(`${data.name} is already registered for mission '${data.mission}'`, 409);
  }

  const now = new Date().toISOString();
  const astronaut = { id: store.nextId('AST'), ...data, createdAt: now, updatedAt: now };
  store.astronauts.push(astronaut);

  return sendSuccess(res, astronaut, { status: 201, message: 'Astronaut added successfully' });
}

// PUT /api/astronauts/:id  (only the fields you send are changed)
function updateAstronaut(req, res) {
  const astronaut = store.findAstronautOrFail(req.params.id);
  const updates = validateUpdateAstronaut(req.body);

  Object.assign(astronaut, updates, { updatedAt: new Date().toISOString() });
  return sendSuccess(res, astronaut, { message: 'Astronaut updated successfully' });
}

module.exports = { listAstronauts, getAstronaut, createAstronaut, updateAstronaut };