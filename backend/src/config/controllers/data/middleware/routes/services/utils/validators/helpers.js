const AppError = require('../utils/AppError');

function assertBodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object', 400);
  }
}

// Checks one value against one rule. Returns { value } or { error }.
function checkType(field, value, rule) {
  switch (rule.type) {
    case 'string': {
      if (typeof value !== 'string') return { error: `${field} must be a string` };
      const text = value.trim();
      if (rule.min && text.length < rule.min) return { error: `${field} must be at least ${rule.min} characters` };
      if (rule.max && text.length > rule.max) return { error: `${field} must be at most ${rule.max} characters` };
      return { value: text };
    }
    case 'number':
    case 'integer': {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return { error: `${field} must be a number (not text)` };
      }
      if (rule.type === 'integer' && !Number.isInteger(value)) {
        return { error: `${field} must be a whole number` };
      }
      if (rule.min !== undefined && value < rule.min) return { error: `${field} must be at least ${rule.min}` };
      if (rule.max !== undefined && value > rule.max) return { error: `${field} must be at most ${rule.max}` };
      return { value };
    }
    case 'enum': {
      const match =
        typeof value === 'string' &&
        rule.allowed.find((item) => item.toLowerCase() === value.toLowerCase());
      if (!match) return { error: `${field} must be one of: ${rule.allowed.join(', ')}` };
      return { value: match };
    }
    case 'date': {
      const date = new Date(value);
      if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
        return { error: `${field} must be a valid ISO date string (e.g. 2026-10-05T08:30:00Z)` };
      }
      if (rule.noFuture && date.getTime() > Date.now() + 60000) {
        return { error: `${field} cannot be in the future` };
      }
      return { value: date.toISOString() };
    }
    default:
      return { error: `${field} has an unsupported rule type` };
  }
}

// Validates a request body against a schema.
// schema example: { age: { type: 'integer', required: true, min: 18, max: 80 } }
// partial = true is used for updates (nothing is required).
// Unknown fields in the body are ignored.
function validateAgainstSchema(body, schema, { partial = false } = {}) {
  assertBodyObject(body);
  const errors = [];
  const clean = {};

  Object.entries(schema).forEach(([field, rule]) => {
    const value = body[field];
    const missing = value === undefined || value === null || value === '';

    if (missing) {
      if (partial) return;
      if (rule.required) {
        errors.push({ field, message: `${field} is required` });
      } else if (rule.default !== undefined) {
        clean[field] = typeof rule.default === 'function' ? rule.default() : rule.default;
      }
      return;
    }

    const result = checkType(field, value, rule);
    if (result.error) errors.push({ field, message: result.error });
    else clean[field] = result.value;
  });

  if (errors.length) throw new AppError('Validation failed', 400, errors);
  return clean;
}

// Reads ?limit= from the query string
function parseLimit(value, defaultLimit = 30, maxLimit = 200) {
  if (value === undefined) return defaultLimit;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > maxLimit) {
    throw new AppError(`limit must be a whole number between 1 and ${maxLimit}`, 400);
  }
  return n;
}

module.exports = { assertBodyObject, validateAgainstSchema, parseLimit };