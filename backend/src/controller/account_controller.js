const accountModal = require('../models/account_modal');
const ledger_model = require('../models/ledger_modal');
const {get, set} = require('../services/cache_service');


async function createAccount(req, res) {
  try {
    const user = req.user;
    const account = await accountModal.create({
      user: user._id,
    });
    res.status(201).json({account});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Server error'});
  }
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



    let totalBalance;
    let creditBalance = 0;
    let debitBalance = 0;


    const Status = account.status || null;
    const accountId = account._id.toString();
    const cachedBalance = await get(accountId);


    if (cachedBalance !== -1) {
      totalBalance = cachedBalance;
    } else {
      const transactions = await ledger_model.find({account: account._id});
      for (const tx of transactions) {
        if (tx.type === 'Credit') {
          creditBalance += tx.amount;

        } else {
          debitBalance += tx.amount;
        }
      }
      totalBalance = creditBalance - debitBalance;
      await set(accountId, totalBalance);
    }
    const transactions =
        await ledger_model.find({account: account._id}).populate('transaction');

    creditBalance = 0;
    debitBalance = 0;

    for (const tx of transactions) {
      if (tx.type === 'Credit') {
        creditBalance += tx.amount;
      } else if (tx.type === 'Debit') {
        debitBalance += tx.amount;
      }
    }

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