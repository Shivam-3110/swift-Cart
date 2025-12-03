import userModel from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redis from '../db/redis.js';
async function registerUser(req,res) {
    const {username,email,password,fullName:{firstName,lastName},role}= req.body;

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
        fullName:{firstName,lastName},
        role:role||'user'
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

async function getUserAddresses(req,res){
    const id = req.user.id;
    const user = await userModel.findById(id).select('addresses');
    if(!user){
        return res.status(404).json({message:"user not found"});
    }
    return res.status(200).json({
        message:"user addresses fetched successfully",
        addresses:user.addresses
    })
}

async function addUserAddress(req,res){
    const id = req.user.id;
    const{street,city,state,pincode,country,phone,isDefault}= req.body;
    const user = await userModel.findOneAndUpdate({_id:id},{
        $push:{addresses:{street,city,state,pincode,country,isDefault}}

    }
    ,{new:true});
    if(!user){
        return res.status(404).json({message:"User not fpund"});
    }
    return res.status(201).json({
        message:"Address added successfully",
        address:user.addresses[user.addresses.length-1]
    });
}

async function deleteUserAddress(req,res) {
    const id = req.user.id;
    const {addressId} = req.params;

    const isAddressExists = await userModel.findOne({_id:id,'addresses._id':addressId});
     if(!isAddressExists){
        return res.status(404).json({message:" Address not found "});

    }

    const user = await userModel.findOneAndUpdate({_id:id},{
        $pull:{
            addresses:{_id:addressId}
        }
    },{new:true});
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const addressExists = user.addresses.some(addr => addr._id.toString()=== addressId);
    if(!addressExists){
        return res.status(500).json({message:"Failed to delete Address"});

    }
    return res.status(200).json({
        message:"Address deleted successfully",
        addresses:user.addresses
    });
}

export default {registerUser, deleteUserAddress,loginUser,getCurrentUser,logoutUser,getUserAddresses,addUserAddress};
