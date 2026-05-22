// ============================================
// Custom Error Class
// ============================================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// Global Error Handler Middleware
// ============================================
const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    error.message = messages.join(', ');
    error.statusCode = 409;
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'Referenced record not found or cannot be deleted due to existing references';
    error.statusCode = 400;
  }

  // Sequelize Database Error
  if (err.name === 'SequelizeDatabaseError') {
    error.message = 'Database error occurred';
    error.statusCode = 500;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { AppError, errorHandler };
