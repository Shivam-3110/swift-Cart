import express from 'express';
import {connect} from './broker/broker.js';
import setListeners from './broker/listener.js';

const app = express();

app.get('/',(req,res)=>{
    res.status(200).json({ message: "Notification service is up and running" });
});

export { app, connect, setListeners };
 