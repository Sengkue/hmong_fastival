const { body } = require('express-validator');
const { Zone, Festival, Booth, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, getPaginatedResponse } = require('../utils/helpers');
const { ROLES, SHAPE_TYPE } = require('../utils/constants');

// ============================================
// Validation Rules
// ============================================
const zoneValidation = [
  body('festivalId').notEmpty().withMessage('Festival ID is required').isInt(),
  body('name').trim().notEmpty().withMessage('Zone name is required'),
  body('description').optional().trim(),
  body('ownerId').optional().isInt(),
  body('shapeType').optional().isIn(Object.values(SHAPE_TYPE)).withMessage('Invalid shape type'),
  body('shapeCoordinates').optional().isObject().withMessage('Shape coordinates must be a JSON object'),
  body('color').optional().trim(),
];

const zoneUpdateValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('ownerId').optional().isInt(),
  body('shapeType').optional().isIn(Object.values(SHAPE_TYPE)),
  body('shapeCoordinates').optional(),
  body('color').optional().trim(),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Get all zones (optionally filtered by festival)
 * @route   GET /api/zones
 * @access  Public
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { festivalId } = req.query;

    const where = { isActive: true };
    if (festivalId) where.festivalId = festivalId;

    const data = await Zone.findAndCountAll({
      where,
      include: [
        { model: Festival, as: 'festival', attributes: ['id', 'name', 'code'] },
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
 * @desc    Get zone by ID (with booths)
 * @route   GET /api/zones/:id
 * @access  Public
 */
const getById = async (req, res, next) => {
  try {
    const zone = await Zone.findByPk(req.params.id, {
      include: [
        { model: Festival, as: 'festival', attributes: ['id', 'name', 'code'] },
        { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
        {
          model: Booth,
          as: 'booths',
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!zone) {
      return next(new AppError('Zone not found', 404));
    }

    res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create zone
 * @route   POST /api/zones
 * @access  Admin
 */
const create = async (req, res, next) => {
  try {
    const { festivalId, ownerId, name, description, shapeType, shapeCoordinates, color } = req.body;

    // Verify festival exists
    const festival = await Festival.findByPk(festivalId);
    if (!festival) {
      return next(new AppError('Festival not found', 404));
    }

    // Verify owner exists if provided
    if (ownerId) {
      const owner = await User.findByPk(ownerId);
      if (!owner || owner.role !== ROLES.OWNER) {
        return next(new AppError('Owner not found or user is not an owner', 400));
      }
    }

    const zone = await Zone.create({
      festivalId, ownerId, name, description, shapeType, shapeCoordinates, color,
    });

    res.status(201).json({
      success: true,
      message: 'Zone created successfully',
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update zone
 * @route   PUT /api/zones/:id
 * @access  Admin / Owner (own zones only)
 */
const update = async (req, res, next) => {
  try {
    const zone = await Zone.findByPk(req.params.id);

    if (!zone) {
      return next(new AppError('Zone not found', 404));
    }

    // Owner can only update their own zones
    if (req.user.role === ROLES.OWNER && zone.ownerId !== req.user.id) {
      return next(new AppError('You can only update your own zones', 403));
    }

    const { name, description, ownerId, shapeType, shapeCoordinates, color } = req.body;

    // Only admin can change owner
    const updateData = { name, description, shapeType, shapeCoordinates, color };
    if (req.user.role === ROLES.ADMIN && ownerId !== undefined) {
      updateData.ownerId = ownerId;
    }

    await zone.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Zone updated successfully',
      data: zone,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete zone (soft delete)
 * @route   DELETE /api/zones/:id
 * @access  Admin
 */
const remove = async (req, res, next) => {
  try {
    const zone = await Zone.findByPk(req.params.id);

    if (!zone) {
      return next(new AppError('Zone not found', 404));
    }

    await zone.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Zone deleted successfully',
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
  zoneValidation,
  zoneUpdateValidation,
};
