const { body } = require('express-validator');
const { Festival, Zone } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, getPaginatedResponse } = require('../utils/helpers');

// ============================================
// Validation Rules
// ============================================
const festivalValidation = [
  body('name').trim().notEmpty().withMessage('Festival name is required'),
  body('code').trim().notEmpty().withMessage('Festival code is required')
    .isLength({ max: 10 }).withMessage('Festival code max 10 characters')
    .toUpperCase(),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('address').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('description').optional().trim(),
];

const festivalUpdateValidation = [
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim().isLength({ max: 10 }).toUpperCase(),
  body('city').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
  body('address').optional().trim(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('description').optional().trim(),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Get all festivals
 * @route   GET /api/festivals
 * @access  Public
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const data = await Festival.findAndCountAll({
      where: { isActive: true },
      limit,
      offset,
      order: [['name', 'ASC']],
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
 * @desc    Get festival by ID (with zones)
 * @route   GET /api/festivals/:id
 * @access  Public
 */
const getById = async (req, res, next) => {
  try {
    const festival = await Festival.findByPk(req.params.id, {
      include: [
        {
          model: Zone,
          as: 'zones',
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!festival) {
      return next(new AppError('Festival not found', 404));
    }

    res.status(200).json({
      success: true,
      data: festival,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create festival
 * @route   POST /api/festivals
 * @access  Admin
 */
const create = async (req, res, next) => {
  try {
    const { name, code, address, city, country, latitude, longitude, description } = req.body;

    // Check unique code
    const existing = await Festival.findOne({ where: { code: code.toUpperCase() } });
    if (existing) {
      return next(new AppError('Festival code already exists', 409));
    }

    const festival = await Festival.create({
      name, code: code.toUpperCase(), address, city, country, latitude, longitude, description,
    });

    res.status(201).json({
      success: true,
      message: 'Festival created successfully',
      data: festival,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update festival
 * @route   PUT /api/festivals/:id
 * @access  Admin
 */
const update = async (req, res, next) => {
  try {
    const festival = await Festival.findByPk(req.params.id);

    if (!festival) {
      return next(new AppError('Festival not found', 404));
    }

    const { name, code, address, city, country, latitude, longitude, description } = req.body;

    // Check unique code if changing
    if (code && code.toUpperCase() !== festival.code) {
      const existing = await Festival.findOne({ where: { code: code.toUpperCase() } });
      if (existing) {
        return next(new AppError('Festival code already in use', 409));
      }
    }

    await festival.update({
      name, code: code ? code.toUpperCase() : festival.code,
      address, city, country, latitude, longitude, description,
    });

    res.status(200).json({
      success: true,
      message: 'Festival updated successfully',
      data: festival,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete festival (soft delete)
 * @route   DELETE /api/festivals/:id
 * @access  Admin
 */
const remove = async (req, res, next) => {
  try {
    const festival = await Festival.findByPk(req.params.id);

    if (!festival) {
      return next(new AppError('Festival not found', 404));
    }

    await festival.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Festival deleted successfully',
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
  festivalValidation,
  festivalUpdateValidation,
};
