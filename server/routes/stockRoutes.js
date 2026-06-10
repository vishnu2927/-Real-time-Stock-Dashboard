const express = require('express');
const { query, param } = require('express-validator');
const { searchStocks, getQuote, getHistory, getNews } = require('../controllers/stockController');

const router = express.Router();

router.get('/search', [query('q').trim().notEmpty().withMessage('Search query is required')], searchStocks);
router.get('/:symbol/quote', [param('symbol').trim().notEmpty()], getQuote);
router.get('/:symbol/history', [param('symbol').trim().notEmpty()], getHistory);
router.get('/:symbol/news', [param('symbol').trim().notEmpty()], getNews);

module.exports = router;
