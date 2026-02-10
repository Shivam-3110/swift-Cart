import mongoose from "mongoose";
const addressesSchema = new mongoose.Schema({
 
         street:String,
         city:String,
         state:String,
         zip:String,
         country:String,
         isDefault:{type:Boolean , default:false}
});
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
    items:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        },
        quantity:{
          type:Number,
          
          default:1,
          min:1
        },
        price:{
          amount:{type:Number, required:true}
        },
        currency:{
          type:String,
          required:true,
          enum:['USD',  'INR']
        }

    }],
    status:{
      type:String,
      required:true,
      enum:['pending', 'Cancelled', 'shipped', 'delivered']
    },
    totalprice:{
      amount:{type:Number, required:true},
      currency:{type:String, required:true, enum:['USD',  'INR']}
    },
    shippingAddress:{
      type:addressesSchema,
      required:true},
}, { timestamps: true});

 
const orderModel  = mongoose.model("Order", orderSchema);


export default orderModel ;