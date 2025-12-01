import dotenv from'dotenv';
dotenv.config();
import app from './src/app.js';
import connectDb from './src/db/db.js';
connectDb();
 const PORT = process.env.PORT||3000 ;
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})