const express = require('express');
const cookieparser = require('cookie-parser');
const authRouter = require('./routes/auth_route')
const accountRoute = require('./routes/account_route')
const transactionRoute = require('./routes/transaction_route');
const getAccountRoute = require('./routes/getAccount_route')
const cors = require('cors');
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// then your routes below...
app.use(express.json());
app.use(cookieparser());
app.use('/api/auth', authRouter);
app.use('/api/accounts',accountRoute);
app.use('/api/Info',getAccountRoute);
app.use('/api/transactions',transactionRoute);

module.exports = app;