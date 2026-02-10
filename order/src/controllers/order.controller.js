import orderModel from "../models/order.model.js";
import axios from "axios";
import { publishToQueue } from "../broker/broker.js";


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
         await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED",order )
       res.status(201).json({order})
   } catch (error) {
    res.status(500).json({message:"Internal server error", error:error.message} );
   }
}

async function getMyOrders(req, res){
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const orders = await OrderModel.find({user:user.id}).skip(skip).limit(limit).sort({createdAt:-1});
        const totalOrders = await OrderModel.countDocuments({user:user.id});
        res.status(200).json({
            orders,
           meta:{
            total:totalOrders,
            page,
            limit,
           }
        });
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message} );
    }
}

async function getOrderById(req, res){
    const user = req.user;
    const orderId = req.params.id; 
    try {
        const order = await OrderModel.findById(orderId);
        if(!order){
            return res.status(404).json({message:"Order not found"});
        }
        if(order.user.toString()!==user.id && user.role !=="admin"){
            return res.status(403).json({message:"Forbidden"});
        }
        res.status(200).json({order});
    } catch (error) {
        res.status(500).json({message:"Internal server error", error:error.message} );
    }
    }

  async function cancelOrderById(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        }

        // only PENDING orders can be cancelled
        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order cannot be cancelled at this stage" });
        }

        order.status = "CANCELLED";
        await order.save();

        res.status(200).json({ order });
    } catch (err) {

        console.error(err);

        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}


async function updateOrderAddress(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({ message: "Forbidden: You do not have access to this order" });
        }

        // only PENDING orders can have address updated
        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order address cannot be updated at this stage" });
        }

        order.shippingAddress = {
            street: req.body.shippingAddress.street,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state,
            zip: req.body.shippingAddress.pincode,
            country: req.body.shippingAddress.country,
        };

        await order.save();

        res.status(200).json({ order });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
}



export default{
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrderById,
    updateOrderAddress
};
