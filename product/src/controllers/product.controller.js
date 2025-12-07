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

export default { createProduct };
