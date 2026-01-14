import cartModel from '../models/cart.model.js';

async function getCart(req,res){
    const user = req.user;
    let cart = await cartModel.findOne({user: user._id}).populate('items.productId');
    if(!cart){
       cart = new cartModel({user: user._id, items: []});
       await cart.save();
    }
    res.status(200).json({
        cart,
        totals:{
            itemCount:cart.items.length,
            totalQuantity:cart.items.reduce((sum,item)=>sum+item.quantity)
        }
    });
}



async function addItemToCart(req, res){
    const {productId, quantity} =  req.body;
    const user = req.user;
    let cart = await cartModel.findOne({user: user._id});
    if(!cart){
        cart = new cartModel({
            user: user._id,
            items: []
        });
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if(existingItemIndex >=0){
        cart.items[existingItemIndex].quantity += qty;
    } else {
        cart.items.push({productId, quantity:qty});
    }
    await cart.save();
    res.status(200).json({message: 'Item added to cart', cart});
}
async function updateItemQuantity(req,res){
    const {productId} = req.params;
    const {quantity} = req.body;
    const user = req.user;
    let cart = await cartModel.findOne({user: user._id});
    if(!cart){
        return res.status(404).json({message: 'Cart not found'});
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if(existingItemIndex < 0){
        return res.status(404).json({message: 'Item not found in cart'});
    } 
    cart.items[existingItemIndex].quantity = qty;
    await cart.save();
    return res.status(200).json({message: 'Cart item updated', cart});
}


export default { addItemToCart, getCart, updateItemQuantity };