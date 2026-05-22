const { AppError } = require('./errorHandler');

/**
 * Role-based authorization middleware
 * Usage: authorize('admin', 'owner')
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Access denied. Please login first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Role '${req.user.role}' is not authorized to access this resource.`, 403)
      );
    }

    next();
  };
};

module.exports = { authorize };
