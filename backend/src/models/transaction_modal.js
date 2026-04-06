const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
      fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Sender required'],
        index: true
      },
      toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Receiver required'],
        index: true
      },
      status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Reversed'],
        default: 'Pending'
      },
      amount: {
        type: Number,
        required: [true, 'Enter amount'],
        min: [0, 'amount should be greater than 0']
      },
      idempotencyKey: {
        type: String,
        required: [true, 'idempotecy Key required for creating a transaction'],
        index: true,
        unique: true
      }
    },
    {
      timestamps: true

    });


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;