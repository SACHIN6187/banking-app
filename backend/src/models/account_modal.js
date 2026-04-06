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
  const result = await ledgerModel.aggregate([
    {$match: {account: this._id}},
    {
      $group: {
        _id: '$type',
        total: {$sum: '$amount'},
      },
    },
  ]);

  let credit = 0;
  let debit = 0;

  for (const item of result) {
    if (item._id === 'Credit') credit = item.total;
    if (item._id === 'Debit') debit = item.total;
  }

  return {
    creditBalance: credit,
    debitBalance: debit,
    totalBalance: credit - debit,
  };
};

const accountModal = mongoose.model('Account', accountSchema);
module.exports = accountModal;