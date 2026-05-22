const { body } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, getPaginatedResponse } = require('../utils/helpers');
const { ROLES } = require('../utils/constants');

// ============================================
// Validation Rules
// ============================================
const createUserValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('phone').optional().trim(),
];

const updateUserValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 100 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('phone').optional().trim(),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Get all users (with pagination, search, filter)
 * @route   GET /api/users
 * @access  Admin
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { search, role } = req.query;

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const data = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      ...getPaginatedResponse(data, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin
 */
const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin creates owner/admin accounts)
 * @route   POST /api/users
 * @access  Admin
 */
const create = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin
 */
const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { firstName, lastName, email, role, phone } = req.body;

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return next(new AppError('Email already in use', 409));
      }
    }

    await user.update({ firstName, lastName, email, role, phone });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent self-deletion
    if (user.id === req.user.id) {
      return next(new AppError('You cannot delete your own account', 400));
    }

    await user.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/users/:id/toggle-active
 * @access  Admin
 */
const toggleActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.id === req.user.id) {
      return next(new AppError('You cannot change your own active status', 400));
    }

    await user.update({ isActive: !user.isActive });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleActive,
  createUserValidation,
  updateUserValidation,
};
