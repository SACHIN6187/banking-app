const user_modal = require('../models/user_modal');
const jwt = require('jsonwebtoken');

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
  const token = req.cookies?.token ||
      (authHeader?.startsWith('Bearer ') && authHeader.split(' ')[1]);
  if (!token) {
    return res.status(401).json({
      message: 'Unautharized acess , token is missing',
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await user_modal.findById(decoded.userId).select("+systemUser");
    if(!user.systemUser){
      return res.status(403).json({
        message:"forbidden access,not a system user"
      })
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