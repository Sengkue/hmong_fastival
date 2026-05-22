const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const bookingController = require('../controllers/booking.controller');
const { ROLES } = require('../utils/constants');

// All booking routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', authorize(ROLES.CUSTOMER), bookingController.bookingValidation, validate, bookingController.create);
router.get('/my/list', authorize(ROLES.CUSTOMER), bookingController.getMyBookings);
router.put('/:id/cancel', authorize(ROLES.CUSTOMER), bookingController.cancel);

// Authenticated (role-filtered in controller)
router.get('/', bookingController.getAll);
router.get('/:id', bookingController.getById);

// Admin/Owner status update
router.put('/:id/status', authorize(ROLES.ADMIN, ROLES.OWNER), bookingController.statusValidation, validate, bookingController.updateStatus);

module.exports = router;
