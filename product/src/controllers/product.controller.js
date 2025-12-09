import productModel from "../models/product.model.js";
import imagekitService from "../services/imagekit.service.js"; 
import mongoose from "mongoose";


async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;

    if (!title || !priceAmount) {  
      return res.status(400).json({ message: "Title and Price Amount are required" });
    }

    const seller = req.user.id;

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    
    const images = await Promise.all(
      (req.files || []).map(file =>
        imagekitService.uploadImage({ buffer: file.buffer }) 
      )
    );

   
    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });

   
    return res.status(201).json({
      message: "Product created",
      data: product,
    });

  } catch (err) {
    console.error("Create product error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts( req, res) {
  const {q, minprice,maxprice,skip=0,limit=20} = req.query;
   const filter = {}
   if(q){
    filter.$text = {$search:q}
   }
   if(minprice){
    filter['price.amount'] = {...filter['price.amount'],$gte:Number(minprice)}
   }
   if(maxprice){
    filter['price.amount'] = {...filter['price.amount'],$gte:Number(maxprice)}
   }
   const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit),20));
   return res.status(200).json({data:products});
}

async function getProductById(req , res){
  const {id} = req.params;
  const product = await productModel.findById(id);
  if(!product){
    return res.status(404).json({message:'product not found'});
  }
  return res.status(200).json({product:product});
}


export default { createProduct , getProducts,getProductById };
