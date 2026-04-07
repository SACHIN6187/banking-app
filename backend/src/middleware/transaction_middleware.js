const user_modal = require('../models/user_model');
const jwt = require('jsonwebtoken');

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