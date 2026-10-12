require('dotenv').config();
const app = require('./src/app');
const connectToDb = require('./src/config/db');
require('./src/controller/rate_limiter_controller');
require('./src/controller/cache_server_controller');


connectToDb();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
