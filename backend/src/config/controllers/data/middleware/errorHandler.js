// Central error handler. Every error response has the shape:
// { success: false, error: { message, details? } }
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // Invalid JSON sent by the client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON in request body' },
    });
  }

  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);

  const message = err.isOperational ? err.message : 'Internal server error';
  const error = { message };
  if (err.details) error.details = err.details;

  return res.status(status).json({ success: false, error });
};