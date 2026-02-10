import dotenv from "dotenv";
dotenv.config();

import app from './src/app.js';
import connectDB from './src/db/db.js';
import { connect } from "./src/broker/broker.js";
 const PORT = process.env.PORT||3001;

connectDB();
connect();
app.listen(PORT ,()=>{
    console.log(`Product service listening  on ${PORT}`);
})