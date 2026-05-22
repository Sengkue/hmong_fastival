const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const paymentController = require('../controllers/payment.controller');
const { ROLES } = require('../utils/constants');

// All payment routes require authentication
router.use(authenticate);

router.post('/', paymentController.paymentValidation, validate, paymentController.create);
router.get('/booking/:bookingId', paymentController.getByBooking);

// Admin-only
router.put('/:id/status', authorize(ROLES.ADMIN), paymentController.paymentStatusValidation, validate, paymentController.updateStatus);

module.exports = router;
