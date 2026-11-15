const AppError = require('../utils/AppError');

module.exports = function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};