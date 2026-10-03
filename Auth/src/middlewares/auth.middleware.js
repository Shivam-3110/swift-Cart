
import userModel from "../models/user.model.js";   
import jwt from "jsonwebtoken";
import redis from "../db/redis.js";

async function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }
    try{
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if(isBlacklisted){
            return res.status(401).json({message: "Token has been invalidated"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({message: "Unauthorized"});
    }
}

export default {
    authMiddleware
};