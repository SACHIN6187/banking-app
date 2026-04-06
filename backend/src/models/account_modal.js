const mongoose = require('mongoose');
const ledgerModel = require('../models/ledger_modal');

const accountSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Account must be associated with a user'],
        index: true
      },
      status: {
        type: String,
        enum: {
          values: ['ACTIVE', 'FROZEN', 'CLOSED'],
          message: 'Status can be either ACTIVE, FROZEN or CLOSED',
        },
        default: 'ACTIVE'
      },
      currency: {
        type: String,
        required: [true, 'Currency is required for creating an account'],
        default: 'INR'
      }
    },
    {timestamps: true})
accountSchema.index({user: 1, status: 1});
accountSchema.methods.getBalanceDetails = async function() {
  const ledgers = await ledgerModel.find({account: this._id});
  console.log(ledgers);
  let credit = 0;
  let debit = 0;

  for (const ledger of ledgers) {
    if (ledger.type === 'Credit') credit += ledger.amount;
    if (ledger.type === 'Debit') debit += ledger.amount;
  }
  return {
    creditBalance: credit,
    debitBalance: debit,
    totalBalance: credit - debit,
  };
};

const accountModal = mongoose.model('Account', accountSchema);
module.exports = accountModal;