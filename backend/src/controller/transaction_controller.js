const {default: mongoose} = require('mongoose');
const accountModel = require('../models/account_modal')
const transactionModel = require('../models/transaction_modal')
const Ledger = require('../models/ledger_modal');
const {sendDebitEmail, sendCreditEmail} =
    require('../services/sendRegistrationEmail');
const userModel = require('../models/user_modal');

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

  // ✅ Fix 1: check the documents directly
  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({message: 'Invalid account number'});
  }

  // validate idempotencyKey
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


  const {totalBalance} = await fromUserAccount.getBalanceDetails();
  console.log(totalBalance);
  if (Number(amount) > totalBalance) {
    return res.status(400).json({message: 'Insufficient balance'});
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ✅ Fix 2: use fromUserAccount._id and toUserAccount._id
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

    // ✅ Send emails after successful commit
    sendDebitEmail(fromUserAccount.user.email, toUserAccount.user.name, amount);
    sendCreditEmail(
        toUserAccount.user.email, fromUserAccount.user.name, amount);

    return res.status(201).json(
        {message: 'Transaction Completed', transaction: transaction[0]});

  } catch (err) {
    // ✅ Fix 3: abort session on error
    await session.abortTransaction();
    return res.status(500).json(
        {message: 'Transaction failed', error: err.message});
  } finally {
    session.endSession();
  }
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

     await Ledger.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "Credit"
    } ], { session })

    transaction.status = "Completed"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}
module.exports = {
  transactionController,
  createInitialFundsTransaction
}