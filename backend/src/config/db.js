const mongoose = require('mongoose');

function connectToDb() {
  mongoose.connect(process.env.MONGO_URI)
      .then(() => {console.log('connected to Mongo Db')})
      .catch(err => {
        console.log('error while connecting')
        process.exit(1);
      });
}

module.exports = connectToDb;