const axios = require('axios');

/**
 * Proxies stock prediction requests to the Python ML service.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function predict(req, res, next) {
  try {
    const { symbol } = req.params;
    const days = Number(req.query.days || 7);
    const baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const { data } = await axios.get(`${baseUrl}/predict/${symbol}`, {
      params: { days },
      timeout: 15000
    });

    return res.status(200).json({ success: true, prediction: data });
  } catch (error) {
    next(error);
  }
}

module.exports = { predict };