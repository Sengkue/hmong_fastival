const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const boothController = require('../controllers/booth.controller');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', boothController.getAll);
router.get('/:id', boothController.getById);

// Owner routes (must be before /:id to avoid route collision)
router.get('/my/list', authenticate, authorize(ROLES.OWNER), boothController.getMyBooths);

// Owner/Admin routes
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.OWNER), boothController.boothValidation, validate, boothController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.OWNER), boothController.boothUpdateValidation, validate, boothController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.OWNER), boothController.remove);

module.exports = router;
