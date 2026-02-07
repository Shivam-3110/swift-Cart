import 'dotenv/config.js';

import app from './src/app.js';
import connectDB from './src/db/payment.db.js';
import {connect} from './src/broker/broker.js';
connectDB();
connect();
app.listen(3004, () => {
  console.log('Payment service is running on port 3004');
});