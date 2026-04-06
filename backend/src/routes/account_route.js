const express = require('express');
const {authMiddleware} = require('../middleware/auth_middleware')
const {createAccount} = require('../controller/account_controller');

const accountRoute = express.Router();



accountRoute.post('/', authMiddleware, createAccount);

module.exports = accountRoute;