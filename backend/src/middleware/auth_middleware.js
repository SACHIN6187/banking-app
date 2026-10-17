const user_modal = require('../models/user_model');
const jwt = require('jsonwebtoken');
const {rate_check} = require('../services/rate_limit');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]);
  if (!token) {
    return res.status(401).json({
      message: 'Unautharized acess , token is missing',
    })
  }
  try {
    const result = await rate_check(token);
    if (result === 'RATE_LIMIT_EXCEEDED') {
      console.warn('Request rate limit exceeded');
      return res.status(429).json({
        message: 'Exceeded request limit',
      });
    }
    if (result === -1) {
      console.error('Rate limiter unavailable');
      return res.status(503).json({
        message: 'Rate limiter service unavailable',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await user_modal.findById(decoded.userId);

    req.user = user;
    return next();

  } catch (err) {
    return res.status(401).json({
      message: 'Unautharized acess , token is missing',
    })
  }
}

async function intialFundtransactionMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]);
  if (!token) {
    return res.status(401).json({
      message: 'Unautharized acess , token is missing',
    })
  }
  try {
    const result = await rate_check(token);
    if (result === 'RATE_LIMIT_EXCEEDED') {
      return res.status(401).json({
        message: 'Exceed request limit',
      })
    }
    if (result === -1) {
      console.error('Rate limiter unavailable');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =
        await user_modal.findById(decoded.userId).select('+systemUser');
    if (!user.systemUser) {
      return res.status(403).json(
          {message: 'forbidden access,not a system user'})
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unautharized acess , token is missing',
    })
  }
}
module.exports = {
  authMiddleware,
  intialFundtransactionMiddleware
};