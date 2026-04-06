const accountModal = require('../models/account_modal');
const transactionmodel = require('../models/transaction_modal')

async function createAccount(req, res) {
  const user = req.user;
  const account = await accountModal.create({
    user: user._id,
  });
  res.status(201).json({account});
}

async function getAccountInfo(req, res) {
  try {
    const user = req.user;

    const account = await accountModal.findOne({
      user: user._id,
    });
    if (!account) {
      return res.status(200).json({account: null});
    }
    const Status = account.status || null;
    const transactions = await transactionmodel.find(
        {$or: [{fromAccount: account._id}, {toAccount: account._id}]});

    let creditBalance = 0;
    let debitBalance = 0;

    for (const tx of transactions) {
      if (tx.toAccount.toString() === account._id.toString()) {
        creditBalance += tx.amount;
      } else {
        debitBalance += tx.amount;
      }
    }

    const totalBalance = creditBalance - debitBalance;

    return res.status(200).json({
      account: {
        _id: account._id,
        totalBalance,
        creditBalance,
        debitBalance,
        transactions,
        Status,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Server error'});
  }
}

module.exports = {
  createAccount,
  getAccountInfo
};