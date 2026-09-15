const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Don't expose stack traces
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Handle 404 routes
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  errorHandler,
  notFound
};