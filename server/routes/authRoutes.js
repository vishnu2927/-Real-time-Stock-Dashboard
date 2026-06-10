const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
	'/register',
	[
		body('name').trim().notEmpty().withMessage('Name is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
	],
	register
);

router.post(
	'/login',
	[
		body('email').isEmail().withMessage('Valid email is required'),
		body('password').notEmpty().withMessage('Password is required')
	],
	login
);

router.post('/refresh', refreshToken);
router.get('/me', authMiddleware, getMe);

module.exports = router;
