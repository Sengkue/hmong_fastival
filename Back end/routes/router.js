const router = require('express').Router();

// Mount all route modules
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/festivals', require('./festival.routes'));
router.use('/zones', require('./zone.routes'));
router.use('/booths', require('./booth.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/payments', require('./payment.routes'));

module.exports = router;
