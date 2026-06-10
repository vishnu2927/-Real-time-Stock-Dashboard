const express = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getWatchlist);
router.post('/add', [body('symbol').trim().notEmpty().withMessage('symbol is required')], addToWatchlist);
router.delete('/:symbol', [param('symbol').trim().notEmpty()], removeFromWatchlist);

module.exports = router;
