const express = require('express');
const {authMiddleware} = require('../middleware/auth_middleware')
const {getAccountInfo} = require('../controller/account_controller');

const getAccountRoute = express.Router();



getAccountRoute.get('/', authMiddleware, getAccountInfo);

module.exports = getAccountRoute;