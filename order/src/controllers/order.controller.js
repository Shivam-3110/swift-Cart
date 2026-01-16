import OrderModel from "../models/order.model.js";
import axios from "axios";

async function createOrder(req, res) {
    const user = req.user;
const token = req.cookies?.token|| req.headers?.authorization?.split(" ")[1];
   try {
       const  cartResponse = await axios.get(`http://localhost:3002/api/cart`,{
          headers:{
            Authorization:`Bearer ${token}`
          }
       })
       console.log("Cart Response:", cartResponse.data.cart.items);
       const products = await Promise.all(cartResponse.data.cart.items.map(async (item)=>{
          return (await axios.get(`http://localhost:3001/api/products/${item.productId}`,{
            headers:{
                Authorization:`Bearer ${token}`
            }
          })).data.data;
       }))
       let priceAmount = 0;
       const orderItems = cartResponse.data.cart.items.map((item, index)=>{
          const product = products.find(p=>p._id.toString()===item.productId);
 if(!product.inStock|| product.inStock<item.quantity){
    throw new Error(`Product ${product.name} is out of stock or does not have enough quantity`);
 }

          const itemTotal = product.price * item.quantity;
          priceAmount += itemTotal;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: {
                amount:itemTotal,
                currency:product.price.currency
            }
          }
       })   
       const order = await OrderModel.create({
          user:user.id,
          items:orderItems,
          status:"pending",
         totalPrice: {
            amount:priceAmount,
            currency:"INR"},
            shippingAddress:{
                street:req.body.shippingAddress.street,
                city:req.body.shippingAddress.city,
                state:req.body.shippingAddress.state,
                zip:req.body.shippingAddress.pincode,
                country:req.body.shippingAddress.country,
            }
       })
       res.status(201).json({order})
   } catch (error) {
    res.status(500).json({message:"Internal server error", error:error.message} );
   }
}



export default{
    createOrder
};
