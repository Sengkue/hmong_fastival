const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const festivalController = require('../controllers/festival.controller');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', festivalController.getAll);
router.get('/:id', festivalController.getById);

// Admin-only routes
router.post('/', authenticate, authorize(ROLES.ADMIN), festivalController.festivalValidation, validate, festivalController.create);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), festivalController.festivalUpdateValidation, validate, festivalController.update);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), festivalController.remove);

module.exports = router;
