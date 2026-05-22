const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Booth, Zone, User, Booking } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, getPaginatedResponse } = require('../utils/helpers');
const { ROLES, BOOTH_STATUS } = require('../utils/constants');

// ============================================
// Validation Rules
// ============================================
const boothValidation = [
  body('zoneId').notEmpty().withMessage('Zone ID is required').isInt(),
  body('name').trim().notEmpty().withMessage('Booth name is required'),
  body('description').optional().trim(),
  body('size').optional().trim(),
  body('pricePerDay').notEmpty().withMessage('Price per day is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const boothUpdateValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('size').optional().trim(),
  body('pricePerDay').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(BOOTH_STATUS)),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Get all booths (with filters)
 * @route   GET /api/booths
 * @access  Public
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { zoneId, status, minPrice, maxPrice } = req.query;

    const where = { isActive: true };
    if (zoneId) where.zoneId = zoneId;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay[Op.lte] = parseFloat(maxPrice);
    }

    const data = await Booth.findAndCountAll({
      where,
      include: [
        { model: Zone, as: 'zone', attributes: ['id', 'name', 'airportId'] },
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
      ],
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
 * @desc    Get booth by ID
 * @route   GET /api/booths/:id
 * @access  Public
 */
const getById = async (req, res, next) => {
  try {
    const booth = await Booth.findByPk(req.params.id, {
      include: [
        { model: Zone, as: 'zone', attributes: ['id', 'name', 'airportId'] },
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });

    if (!booth) {
      return next(new AppError('Booth not found', 404));
    }

    res.status(200).json({
      success: true,
      data: booth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my booths (owner)
 * @route   GET /api/booths/my/list
 * @access  Owner
 */
const getMyBooths = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const data = await Booth.findAndCountAll({
      where: { ownerId: req.user.id, isActive: true },
      include: [
        { model: Zone, as: 'zone', attributes: ['id', 'name', 'airportId'] },
      ],
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
 * @desc    Create booth
 * @route   POST /api/booths
 * @access  Owner / Admin
 */
const create = async (req, res, next) => {
  try {
    const { zoneId, name, description, size, pricePerDay } = req.body;

    // Verify zone exists
    const zone = await Zone.findByPk(zoneId);
    if (!zone) {
      return next(new AppError('Zone not found', 404));
    }

    // Owner can only add booths to their own zones
    if (req.user.role === ROLES.OWNER && zone.ownerId !== req.user.id) {
      return next(new AppError('You can only add booths to your own zones', 403));
    }

    const ownerId = req.user.role === ROLES.ADMIN ? (req.body.ownerId || req.user.id) : req.user.id;

    const booth = await Booth.create({
      zoneId, ownerId, name, description, size, pricePerDay,
    });

    res.status(201).json({
      success: true,
      message: 'Booth created successfully',
      data: booth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booth
 * @route   PUT /api/booths/:id
 * @access  Owner (own booths) / Admin
 */
const update = async (req, res, next) => {
  try {
    const booth = await Booth.findByPk(req.params.id);

    if (!booth) {
      return next(new AppError('Booth not found', 404));
    }

    // Owner can only update their own booths
    if (req.user.role === ROLES.OWNER && booth.ownerId !== req.user.id) {
      return next(new AppError('You can only update your own booths', 403));
    }

    const { name, description, size, pricePerDay, status } = req.body;

    await booth.update({ name, description, size, pricePerDay, status });

    res.status(200).json({
      success: true,
      message: 'Booth updated successfully',
      data: booth,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete booth (soft delete)
 * @route   DELETE /api/booths/:id
 * @access  Owner (own booths) / Admin
 */
const remove = async (req, res, next) => {
  try {
    const booth = await Booth.findByPk(req.params.id);

    if (!booth) {
      return next(new AppError('Booth not found', 404));
    }

    // Owner can only delete their own booths
    if (req.user.role === ROLES.OWNER && booth.ownerId !== req.user.id) {
      return next(new AppError('You can only delete your own booths', 403));
    }

    await booth.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Booth deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getMyBooths,
  create,
  update,
  remove,
  boothValidation,
  boothUpdateValidation,
};
