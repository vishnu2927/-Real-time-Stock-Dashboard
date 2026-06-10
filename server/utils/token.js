const jwt = require('jsonwebtoken');

/**
 * Signs an access token.
 * @param {object} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-access-secret', { expiresIn: '15m' });
}

/**
 * Signs a refresh token.
 * @param {object} payload
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', { expiresIn: '7d' });
}

module.exports = { signAccessToken, signRefreshToken };