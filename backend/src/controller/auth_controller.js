const userModel = require('../models/user_modal');
const jwt = require('jsonwebtoken');
const sendRegistrationEmail = require('../services/sendRegistrationEmail');

async function registerUserController(req, res) {
  const {email, name, password} = req.body;

  const existUser = await userModel.findOne({email: email});
  if (existUser) {
    return res.status(422).json({
      message: 'user already exist with this email',
      status: 'failed',
    });
  }
  const user = await userModel.create({email, name, password});

  

  
  const token =
      jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'});
  res.cookie('token', token);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    token
  })
  sendRegistrationEmail(email,name)
      .then(() => console.log('Email sent'))
      .catch(err => console.log('Email error:', err));
}

async function signInController(req, res) {
  const {email, password} = req.body;
  const user = await userModel.findOne({ email }).select("+password");  // as the password is hidden so by +password we access it
                     // when the query runs;
  if (!user) {
    return res.status(404).json({message: 'Email or Password is invalid'});
  }
  const isValiduser = await user.comparePassword(password);
  if (!isValiduser)
    return res.status(401).json({message: 'Email or Password is invalid'});
  const token =
      jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'});
  res.cookie('token', token);
  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    token
  })
}

module.exports = {
  registerUserController,
  signInController
};
