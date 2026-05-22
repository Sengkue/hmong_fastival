const jwt = require('jsonwebtoken');
const { PAGINATION } = require('./constants');

/**
 * Generate JWT token for a user
 * @param {number} userId - The user ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Calculate booking total price based on daily rate and date range
 * @param {number} pricePerDay - Price per day
 * @param {string|Date} startDate - Booking start date
 * @param {string|Date} endDate - Booking end date
 * @returns {number} Total price
 */
const calculateBookingPrice = (pricePerDay, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Minimum 1 day charge
  const days = diffDays < 1 ? 1 : diffDays;
  return parseFloat((pricePerDay * days).toFixed(2));
};

/**
 * Build pagination options for Sequelize queries
 * @param {object} query - Request query params (page, limit)
 * @returns {object} { page, limit, offset }
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Format paginated response
 * @param {object} data - Sequelize findAndCountAll result { count, rows }
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Formatted response with pagination meta
 */
const getPaginatedResponse = (data, page, limit) => {
  const totalPages = Math.ceil(data.count / limit);
  return {
    data: data.rows,
    pagination: {
      totalItems: data.count,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = {
  generateToken,
  calculateBookingPrice,
  getPagination,
  getPaginatedResponse,
};
