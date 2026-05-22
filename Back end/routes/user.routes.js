const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const userController = require('../controllers/user.controller');
const { ROLES } = require('../utils/constants');

// All routes require admin access
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.createUserValidation, validate, userController.create);
router.put('/:id', userController.updateUserValidation, validate, userController.update);
router.delete('/:id', userController.remove);
router.patch('/:id/toggle-active', userController.toggleActive);

module.exports = router;
