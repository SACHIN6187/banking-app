const express = require('express');
const {registerUserController,signInController} = require('../controller/auth_controller');

const authRouter = express.Router();

//for usr registration
authRouter.post('/register', registerUserController);

//for user login
authRouter.post('/signin',signInController);

module.exports = authRouter;