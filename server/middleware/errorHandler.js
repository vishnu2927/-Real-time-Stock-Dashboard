/**
 * Returns a JSON 404 response for unknown routes.
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
function notFound(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

/**
 * Global error handler.
 * @param {Error} error
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
function errorHandler(error, _req, res, _next) {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}

module.exports = { notFound, errorHandler };
