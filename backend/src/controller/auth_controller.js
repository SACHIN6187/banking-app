const userModel = require('../models/user_model');
const jwt = require('jsonwebtoken');
const {sendRegistrationEmail, sendOtpMail} =
    require('../services/sendRegistrationEmail');
const bcrypt = require('bcrypt');

async function otpController(req, res) {
  try {
    const {email, name, password} = req.body;

    let user = await userModel.findOne({email});

    if (user && user.is_verified) {
      return res.status(422).json({
        message: 'User already exists',
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    if (!user) {
      user = new userModel({
        email,
        name,
        password,
      });
    }

    user.otp_login = {
      otp_hash: hashedOtp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_used: false,
    };

    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({
      message: 'OTP sent successfully',
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function registerUserController(req, res) {
  try {
    const {email, otp} = req.body;

    const user = await userModel.findOne({email});

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please request OTP first',
      });
    }

    if (!user.otp_login || !user.otp_login.otp_hash) {
      return res.status(400).json({
        message: 'OTP not found. Please request again',
      });
    }

    if (new Date() > user.otp_login.expires_at) {
      return res.status(400).json({
        message: 'OTP expired',
      });
    }

    if (user.otp_login.is_used) {
      return res.status(400).json({
        message: 'OTP already used',
      });
    }

    const isMatch =
        await bcrypt.compare(otp.toString(), user.otp_login.otp_hash);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    user.is_verified = true;
    user.otp_login.is_used = true;

    await user.save();
    const token =
        jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });

    sendRegistrationEmail(email, user.name)
        .then(() => console.log('Email sent'))
        .catch(err => console.log('Email error:', err));

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function signInController(req, res) {
  try {
    const {email, password} = req.body;
    const user = await userModel.findOne({email}).select('+password');
    if (!user) {
      return res.status(404).json({
        message: 'Email or Password is invalid',
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Please verify your account first',
      });
    }

    const isValidUser = await user.comparePassword(password);

    if (!isValidUser) {
      return res.status(401).json({
        message: 'Email or Password is invalid',
      });
    }

    const token =
        jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '3d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  otpController,
  registerUserController,
  signInController,
};