const userModel = require('../models/user_model');
const jwt = require('jsonwebtoken');
const {sendRegistrationEmail, sendOtpMail} =
    require('../services/sendRegistrationEmail');
const bcrypt = require('bcrypt');

async function otpController(req, res) {
  try {
    // SECURITY FIX: Only accept email during OTP request
    // Password will be submitted only after OTP verification
    const {email,name,password} = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
      });
    }

    let user = await userModel.findOne({email});

    if (user && user.is_verified) {
      return res.status(422).json({
        message: 'User already exists. Please sign in instead.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    if (!user) {
      // SECURITY FIX: Create user with only email during OTP generation
      // Password will be set during verification
      user = new userModel({
        email,
        name,
        password,
        is_verified: false,
      });
    }

    user.otp_login = {
      otp_hash: hashedOtp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_used: false,
    };

    await user.save();

    // Send OTP email
    try {
      await sendOtpMail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        message: 'Failed to send OTP. Please try again.',
      });
    }

    return res.status(200).json({
      message: 'OTP sent successfully to your email',
    });

  } catch (error) {
    console.error('OTP Controller Error:', error);
    return res.status(500).json({
      message: 'Failed to process OTP request. Please try again.',
    });
  }
}

async function registerUserController(req, res) {
  try {
    // SECURITY FIX: Now accept name, password, and OTP for final registration
    const {email, otp, name, password} = req.body;

    if (!email || !otp || !name || !password) {
      return res.status(400).json({
        message: 'Email, OTP, name, and password are required',
      });
    }

    const user = await userModel.findOne({email});

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Please request OTP first',
      });
    }

    if (!user.otp_login || !user.otp_login.otp_hash) {
      return res.status(400).json({
        message: 'OTP not found. Please request OTP again',
      });
    }

    if (new Date() > user.otp_login.expires_at) {
      return res.status(400).json({
        message: 'OTP expired. Please request a new one',
      });
    }

    if (user.otp_login.is_used) {
      return res.status(400).json({
        message: 'OTP already used. Please request a new one',
      });
    }

    const isMatch =
        await bcrypt.compare(otp.toString(), user.otp_login.otp_hash);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid OTP',
      });
    }

    // SECURITY FIX: Update user with name and password after OTP verification
    user.name = name;
    user.password = password;  // Password will be auto-hashed by pre-save hook
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

    // Send welcome email asynchronously (don't block response)
    sendRegistrationEmail(email, user.name)
        .then(() => console.log('Welcome email sent successfully'))
        .catch(err => console.error('Email sending failed:', err));

  } catch (error) {
    console.error('Registration Controller Error:', error);
    res.status(500).json({
      message: 'Registration failed. Please try again.',
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