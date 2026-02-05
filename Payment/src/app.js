import express from 'express';
 import cookierParser from 'cookie-parser';
 import paymentRoutes from './routes/payment.routes.js';


const app = express();
app.use(express.json());
app.use(cookierParser());

app.use('/api/payments',paymentRoutes);



export default app;
