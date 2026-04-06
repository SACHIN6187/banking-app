const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
    {
      account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
        index: true,
        immutable: true
      },
      type: {
        type: String,
        enum: ['Credit', 'Debit'],
        required: true,
        immutable: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0.01, 'Amount must be greater than 0'],
        immutable: true
      },
      transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true,
        immutable: true
      }
    },
    {timestamps: true});


ledgerSchema.index({account: 1, createdAt: -1});

// Prevent modifications
function preventLedgerModification() {
  throw new Error('Ledger entry cannot be changed');
}
ledgerSchema.pre(
    /^(deleteMany|deleteOne|findOneAndDelete|updateOne|updateMany|findOneAndUpdate)$/,
    preventLedgerModification);

const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;