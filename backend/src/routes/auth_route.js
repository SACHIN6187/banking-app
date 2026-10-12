const express = require('express');
const {registerUserController, signInController, otpController} =
    require('../controller/auth_controller');

const authRouter = express.Router();

// for usr registration
authRouter.post('/register', registerUserController);

authRouter.post('/register/otp', otpController);

// for user login
authRouter.post('/signin', signInController);

module.exports = authRouter;