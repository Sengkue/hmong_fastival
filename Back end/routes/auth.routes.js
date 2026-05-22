const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/auth.controller');

// Public routes
router.post('/register', authController.registerValidation, validate, authController.register);
router.post('/login', authController.loginValidation, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePasswordValidation, validate, authController.changePassword);

module.exports = router;
