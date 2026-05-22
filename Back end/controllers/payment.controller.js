const { body } = require('express-validator');
const { Payment, Booking, Booth } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { PAYMENT_STATUS, PAYMENT_METHOD, BOOKING_STATUS, ROLES } = require('../utils/constants');

// ============================================
// Validation Rules
// ============================================
const paymentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required').isInt(),
  body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0 }),
  body('method').notEmpty().withMessage('Payment method is required')
    .isIn(Object.values(PAYMENT_METHOD)).withMessage('Invalid payment method'),
  body('transactionRef').optional().trim(),
];

const paymentStatusValidation = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn(Object.values(PAYMENT_STATUS)).withMessage('Invalid payment status'),
];

// ============================================
// Controller Methods
// ============================================

/**
 * @desc    Create a payment for a booking
 * @route   POST /api/payments
 * @access  Authenticated
 */
const create = async (req, res, next) => {
  try {
    const { bookingId, amount, method, transactionRef } = req.body;

    // Verify booking exists
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Booth, as: 'booth' }],
    });

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if customer owns the booking or user is admin/owner
    if (req.user.role === ROLES.CUSTOMER && booking.customerId !== req.user.id) {
      return next(new AppError('You can only pay for your own bookings', 403));
    }

    if (req.user.role === ROLES.OWNER && booking.booth.ownerId !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { bookingId } });
    if (existingPayment) {
      return next(new AppError('Payment already exists for this booking', 409));
    }

    // Booking must be confirmed before payment
    if (booking.status !== BOOKING_STATUS.CONFIRMED && booking.status !== BOOKING_STATUS.PENDING) {
      return next(new AppError('Cannot create payment for a cancelled or completed booking', 400));
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      method,
      transactionRef,
      status: PAYMENT_STATUS.PENDING,
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment by booking ID
 * @route   GET /api/payments/booking/:bookingId
 * @access  Authenticated
 */
const getByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      where: { bookingId: req.params.bookingId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [{ model: Booth, as: 'booth' }],
        },
      ],
    });

    if (!payment) {
      return next(new AppError('Payment not found for this booking', 404));
    }

    // Access control
    if (req.user.role === ROLES.CUSTOMER && payment.booking.customerId !== req.user.id) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update payment status
 * @route   PUT /api/payments/:id/status
 * @access  Admin
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    const updateData = { status };
    if (status === PAYMENT_STATUS.COMPLETED) {
      updateData.paidAt = new Date();
    }

    await payment.update(updateData);

    // If payment completed, confirm the booking
    if (status === PAYMENT_STATUS.COMPLETED) {
      await Booking.update(
        { status: BOOKING_STATUS.CONFIRMED },
        { where: { id: payment.bookingId } }
      );
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getByBooking,
  updateStatus,
  paymentValidation,
  paymentStatusValidation,
};
