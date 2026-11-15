// Every successful response has the same shape: { success: true, message?, meta?, data }
function sendSuccess(res, data, options = {}) {
  const { status = 200, message, meta } = options;
  const body = { success: true };
  if (message) body.message = message;
  if (meta) body.meta = meta;
  body.data = data;
  return res.status(status).json(body);
}

module.exports = { sendSuccess };