const user_modal = require('../models/user_model');
const jwt = require('jsonwebtoken');
const {rate_check} = require('../services/rate_limit');

async function transactionMiddleware(req, res, next) {
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
      console.log('too many requests');
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

module.exports = transactionMiddleware;