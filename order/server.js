import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import connectDB from './src/db/db.js';
import { connect } from "./src/broker/broker.js";
connectDB();
connect();
app.listen(3003, () => {
  console.log('Order service is running on port 3003');
});