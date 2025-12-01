import express from'express';
import cookieParser from 'cookie-parser';
import router from '../src/routes/auth.routes.js';


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(router);


export default app;