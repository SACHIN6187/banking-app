const express = require('express');
const transactionController = require('../controller/transaction_controller');
const transactionMiddleware = require('../middleware/transaction_middleware');
const {intialFundtransactionMiddleware} = require('../middleware/auth_middleware')
const transactionRoute = express.Router();

// create transaction
transactionRoute.post(
    '/', transactionMiddleware, transactionController.transactionController);
//system generated fund;
transactionRoute.post(
    '/intial-fund',intialFundtransactionMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRoute;  