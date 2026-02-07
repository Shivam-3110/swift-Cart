import dotenv from'dotenv';
dotenv.config();
import app from './src/app.js';
import connectDb from './src/db/db.js';
import {connect} from './src/broker/broker.js';
connectDb();
connect();
 const PORT = process.env.PORT||3000 ;
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})