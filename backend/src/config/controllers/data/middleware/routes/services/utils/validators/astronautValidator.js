const AppError = require('../utils/AppError');
const { validateAgainstSchema } = require('./helpers');

const astronautSchema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
  age: { type: 'integer', required: true, min: 18, max: 80 },
  gender: { type: 'enum', allowed: ['female', 'male', 'non-binary', 'other'] },
  nationality: { type: 'string', max: 60 },
  role: { type: 'string', required: true, min: 2, max: 60 },
  mission: { type: 'string', required: true, min: 2, max: 100 },
  status: { type: 'enum', allowed: ['active', 'standby', 'recovering'], default: 'active' },
  heightCm: { type: 'number', min: 120, max: 220 },
  weightKg: { type: 'number', min: 35, max: 200 },
  bloodType: { type: 'enum', allowed: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
};

function validateCreateAstronaut(body) {
  return validateAgainstSchema(body, astronautSchema);
}

function validateUpdateAstronaut(body) {
  const clean = validateAgainstSchema(body, astronautSchema, { partial: true });
  if (Object.keys(clean).length === 0) {
    throw new AppError('Provide at least one valid field to update', 400, {
      allowedFields: Object.keys(astronautSchema),
    });
  }
  return clean;
}

module.exports = { validateCreateAstronaut, validateUpdateAstronaut };