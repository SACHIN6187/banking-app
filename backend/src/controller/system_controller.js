// controller/system_controller.js
const userModel = require('../models/user_model');

async function checkSystemUser(req, res) {
  try {
    const user = await userModel.findById(req.user._id)
                     .select('+systemUser');
    const isSystemUser = user.systemUser;
    res.json({isSystemUser});
  } catch (err) {
    res.status(500).json({message: 'Server error'});
  }
}

module.exports = {checkSystemUser};