import dotenv from 'dotenv';
dotenv.config();

import { app, connect, setListeners } from './src/app.js';

connect().then(() => {
    setListeners();
});

app.listen(3006,()=>{
    console.log('Notification service is running on port 3006');
});