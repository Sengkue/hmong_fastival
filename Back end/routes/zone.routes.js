const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const zoneController = require('../controllers/zone.controller');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', zoneController.getAll);
router.get('/:id', zoneController.getById);

// Admin-only routes
router.post('/', authenticate, authorize(ROLES.ADMIN), zoneController.zoneValidation, validate, zoneController.create);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), zoneController.remove);

// Admin or Owner
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.OWNER), zoneController.zoneUpdateValidation, validate, zoneController.update);

module.exports = router;
