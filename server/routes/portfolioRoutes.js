const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getPortfolio, addStock, removeStock, getSummary } = require('../controllers/portfolioController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getPortfolio);
router.post(
	'/add',
	[
		body('symbol').trim().notEmpty().withMessage('symbol is required'),
		body('companyName').trim().notEmpty().withMessage('companyName is required'),
		body('buyPrice').isFloat({ min: 0 }).withMessage('buyPrice must be a valid number'),
		body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
		body('buyDate').isISO8601().withMessage('buyDate must be a valid date')
	],
	addStock
);
router.delete('/:id', [param('id').notEmpty()], removeStock);
router.get('/summary', getSummary);

module.exports = router;
