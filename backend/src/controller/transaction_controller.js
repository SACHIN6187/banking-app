const {mongoose} = require('mongoose');
const accountModel = require('../models/account_modal')
const transactionModel = require('../models/transaction_modal')
const Ledger = require('../models/ledger_modal')
const {invalidateBalance, invalidateTransaction} =
    require('../services/cache_service');

const {sendDebitEmail, sendCreditEmail} =
    require('../services/sendRegistrationEmail');

async function transactionController(req, res) {
  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: 'fromAccount, toAccount, amount, idempotencyKey are required'
    });
  }

  const [fromUserAccount, toUserAccount] = await Promise.all([
    accountModel.findOne({_id: fromAccount}).populate('user'),
    accountModel.findOne({_id: toAccount}).populate('user'),
  ]);

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({message: 'Invalid account number'});
  }

  const isUnique = await transactionModel.findOne({idempotencyKey});
  if (isUnique) {
    const statusMessages = {
      Completed: 'Transaction Completed',
      Pending: 'Transaction in processing',
      Failed: 'Transaction Failed',
      Reversed: 'Transaction Reversed',
    };
    if (statusMessages[isUnique.status]) {
      return res.status(200).json({message: statusMessages[isUnique.status]});
    }
  }

  if (fromUserAccount.status !== 'ACTIVE' ||
      toUserAccount.status !== 'ACTIVE') {
    return res.status(400).json({message: 'Account is inactive'});
  }


  const {totalBalance: totalFromBalance} =
      await fromUserAccount.getBalanceDetails();
  if (Number(amount) > totalFromBalance) {
    return res.status(400).json({message: 'Insufficient balance'});
  }
  const {totalBalance: totalToBalance} =
      await toUserAccount.getBalanceDetails();
  const newFromBalance = totalFromBalance - Number(amount);
  const newToBalance = totalToBalance + Number(amount);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await transactionModel.create(
        [{
          fromAccount: fromUserAccount._id,
          toAccount: toUserAccount._id,
          amount,
          status: 'Pending',
          idempotencyKey
        }],
        {session});

    await Ledger.create(
        [{
          account: fromUserAccount._id,
          type: 'Debit',
          amount,
          transaction: transaction[0]._id
        }],
        {session});

    await Ledger.create(
        [{
          account: toUserAccount._id,
          type: 'Credit',
          amount,
          transaction: transaction[0]._id
        }],
        {session});

    transaction[0].status = 'Completed';
    await transaction[0].save({session});

    await session.commitTransaction();

    const affectedAccounts = [
      fromUserAccount._id.toString(),
      toUserAccount._id.toString(),
    ];
    await Promise.all(affectedAccounts.flatMap(
        (accountId) =>
            [invalidateBalance(accountId),
             invalidateTransaction(accountId),
    ]));

    sendDebitEmail(fromUserAccount.user.email, toUserAccount.user.name, amount);
    sendCreditEmail(
        toUserAccount.user.email, fromUserAccount.user.name, amount);

    return res.status(201).json(
        {message: 'Transaction Completed', transaction: transaction[0]});

  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json(
        {message: 'Transaction failed', error: err.message});
  } finally {
    session.endSession();
  }
}
async function createInitialFundsTransaction(req, res) {
  try {
    const {amount, idempotencyKey} = req.body;
    const user_ID = req.user._id;

    const accountInfo = await accountModel.findOne({user: user_ID});

    if (!accountInfo) {
      return res.status(400).json({
        message: 'Invalid account',
      });
    }

    const toAccount = accountInfo._id;

    if (!amount || !idempotencyKey) {
      return res.status(400).json({
        message: 'amount and idempotencyKey are required',
      });
    }

    const existing = await transactionModel.findOne({idempotencyKey});

    if (existing) {
      return res.status(200).json({
        message: 'Transaction already processed',
        transaction: existing,
      });
    }

    const {totalBalance: totalToBalance} =
        await accountInfo.getBalanceDetails();

    const totalUserBalance = totalToBalance + Number(amount);

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
      fromAccount: toAccount,
      toAccount: toAccount,
      amount,
      idempotencyKey,
      status: 'PENDING',
    });

    await Ledger.create(
        [
          {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: 'Credit',
          },
        ],
        {session});

    transaction.status = 'Completed';

    await transaction.save({session});

    await session.commitTransaction();
    session.endSession();

    const accountId = toAccount.toString();
    await Promise.all([
      invalidateBalance(accountId),
      invalidateTransaction(accountId),
    ]);


    return res.status(201).json({
      message: 'Initial funds transaction completed successfully',
      transaction,
    });

  } catch (err) {
    console.error('ERROR:', err);

    return res.status(500).json({
      message: 'Server error',
    });
  }
}
module.exports = {
  transactionController,
  createInitialFundsTransaction
}