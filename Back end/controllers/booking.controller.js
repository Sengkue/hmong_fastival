const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Booking, Booth, User, Payment, Zone } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, getPaginatedResponse, calculateBookingPrice } = require('../utils/helpers');
const { ROLES, BOOKING_STATUS, BOOTH_STATUS } = require('../utils/constants');

// ============================================
// Validation Rules
// ============================================
const bookingValidation = [
  body('boothId').notEmpty().withMessage('Booth ID is required').isInt(),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid date format'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim(),
];

const statusValidation = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn([BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED])
    .withMessage('Invalid status'),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Create a booking
 * @route   POST /api/bookings
 * @access  Customer
 */
const create = async (req, res, next) => {
  try {
    const { boothId, startDate, endDate, notes } = req.body;

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return next(new AppError('End date must be after start date', 400));
    }

    if (new Date(startDate) < new Date().setHours(0, 0, 0, 0)) {
      return next(new AppError('Start date cannot be in the past', 400));
    }

    // Check booth exists and is available
    const booth = await Booth.findByPk(boothId);
    if (!booth) {
      return next(new AppError('Booth not found', 404));
    }

    if (!booth.isActive) {
      return next(new AppError('Booth is not available', 400));
    }

    if (booth.status === BOOTH_STATUS.MAINTENANCE) {
      return next(new AppError('Booth is currently under maintenance', 400));
    }

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      where: {
        boothId,
        status: { [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] },
          },
          {
            endDate: { [Op.between]: [startDate, endDate] },
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return next(new AppError('Booth is already booked for the selected dates', 409));
    }

    // Calculate total price
    const totalPrice = calculateBookingPrice(parseFloat(booth.pricePerDay), startDate, endDate);

    const booking = await Booking.create({
      boothId,
      customerId: req.user.id,
      startDate,
      endDate,
      totalPrice,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings (role-filtered)
 * @route   GET /api/bookings
 * @access  Authenticated
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    // Filter by role
    if (req.user.role === ROLES.CUSTOMER) {
      where.customerId = req.user.id;
    } else if (req.user.role === ROLES.OWNER) {
      // Owner sees bookings for their own booths
      const ownerBooths = await Booth.findAll({
        where: { ownerId: req.user.id },
        attributes: ['id'],
      });
      where.boothId = { [Op.in]: ownerBooths.map((b) => b.id) };
    }
    // Admin sees all

    const data = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: Booth,
          as: 'booth',
          attributes: ['id', 'name', 'pricePerDay', 'zoneId'],
          include: [{ model: Zone, as: 'zone', attributes: ['id', 'name'] }],
        },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Payment, as: 'payment' },
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
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Authenticated
 */
const getById = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Booth,
          as: 'booth',
          include: [
            { model: Zone, as: 'zone' },
            { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'] },
          ],
        },
        { model: User, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { model: Payment, as: 'payment' },
      ],
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Customers can only see their own bookings
    if (req.user.role === ROLES.CUSTOMER && booking.customerId !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    // Owners can only see bookings for their booths
    if (req.user.role === ROLES.OWNER && booking.booth.ownerId !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my bookings (customer)
 * @route   GET /api/bookings/my/list
 * @access  Customer
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const data = await Booking.findAndCountAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: Booth,
          as: 'booth',
          attributes: ['id', 'name', 'pricePerDay'],
          include: [{ model: Zone, as: 'zone', attributes: ['id', 'name'] }],
        },
        { model: Payment, as: 'payment' },
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
 * @desc    Update booking status (approve/reject)
 * @route   PUT /api/bookings/:id/status
 * @access  Admin / Owner
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Booth, as: 'booth' }],
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Owner can only update bookings for their booths
    if (req.user.role === ROLES.OWNER && booking.booth.ownerId !== req.user.id) {
      return next(new AppError('You can only manage bookings for your own booths', 403));
    }

    // Validate status transitions
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return next(new AppError('Cannot update a cancelled booking', 400));
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return next(new AppError('Cannot update a completed booking', 400));
    }

    await booking.update({ status });

    // Update booth status based on booking
    if (status === BOOKING_STATUS.CONFIRMED) {
      await booking.booth.update({ status: BOOTH_STATUS.BOOKED });
    } else if (status === BOOKING_STATUS.CANCELLED || status === BOOKING_STATUS.COMPLETED) {
      await booking.booth.update({ status: BOOTH_STATUS.AVAILABLE });
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking (customer)
 * @route   PUT /api/bookings/:id/cancel
 * @access  Customer
 */
const cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Booth, as: 'booth' }],
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.customerId !== req.user.id) {
      return next(new AppError('You can only cancel your own bookings', 403));
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return next(new AppError('Booking is already cancelled', 400));
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return next(new AppError('Cannot cancel a completed booking', 400));
    }

    await booking.update({ status: BOOKING_STATUS.CANCELLED });
    await booking.booth.update({ status: BOOTH_STATUS.AVAILABLE });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  getMyBookings,
  updateStatus,
  cancel,
  bookingValidation,
  statusValidation,
};
