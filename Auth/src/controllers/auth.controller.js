import userModel from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redis from '../db/redis.js';
async function registerUser(req,res) {
    const {username,email,password,fullName:{firstName,lastName}}= req.body;

    const isUserAlreadyExists = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    });
    if(isUserAlreadyExists){
        return res.status(409).json({message:"Username or email already exists"});
    }
    const hash = await bcrypt.hash(password,10);
    const user = await userModel.create({
        username,
        email,
        password:hash,
        fullName:{firstName,lastName}
    })
    const token = jwt.sign({
        id:user._id,
        username:user.username,
        email:user.email,
        role:user.role,
     } ,process.env.JWT_SECRET,{expiresIn:'1d'});
     
     res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        maxAge:24*60*60*1000,
     })

res.status(201).json({
    message:"user registered successfully",
    user:{
        id:user._id,
        username:user.username,
        email:user.email,
        fullName:user.fullName,
    }
})

    
}

async function loginUser(req, res) {
    const {username, email, password } = req.body;

    const user = await userModel.findOne({ $or:[{email },{username}]}).select('+password');
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        message: 'Login successful',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
        }
    });
}

async function getCurrentUser(req, res) {
    return res.status(200).json({
        message:"current user fetched successfully",
        user:req.user
    });
}

async function logoutUser(req,res){
    const token = req.cookies.token;
    if(token){
        await redis.set(`blacklist:${token}`,'true','EX',24*60*60);
    }
    res.clearCookie('token',{
        httpOnly:true,
        secure:true,
    });
    return res.status(200).json({message:"Logged out successfully"});
}


export default {registerUser, loginUser,getCurrentUser,logoutUser};
