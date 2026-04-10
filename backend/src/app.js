const express = require('express');
const cookieparser = require('cookie-parser');
const authRouter = require('./routes/auth_route')
const accountRoute = require('./routes/account_route')
const transactionRoute = require('./routes/transaction_route');
const getAccountRoute = require('./routes/getAccount_route')
const issytemUserRoute = require('./routes/isSystmeUser')
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieparser());
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRoute);
app.use('/api/Info', getAccountRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/check', issytemUserRoute);

module.exports = app;