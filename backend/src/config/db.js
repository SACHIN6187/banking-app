const mongoose = require('mongoose');
const cron = require('node-cron');
const User = require('../models/user_model');
function connectToDb() {
  mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('connected to Mongo Db');
        cron.schedule('*/2 * * * *', async () => {
          const now = new Date();
          await User.updateMany({'otp_login.expires_at': {$lt: now}}, {
            $unset: {
              otp_login: '',
            },
          });
          console.log('Expired OTPs cleared');
        });
      })
      .catch(err => {
        console.log('error while connecting', err);
        process.exit(1);
      });
}

module.exports = connectToDb;