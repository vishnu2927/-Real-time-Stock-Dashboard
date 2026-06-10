const express = require('express');
const { param } = require('express-validator');
const { predict } = require('../controllers/mlController');

const router = express.Router();

router.get('/:symbol/predict', [param('symbol').trim().notEmpty()], predict);

module.exports = router;