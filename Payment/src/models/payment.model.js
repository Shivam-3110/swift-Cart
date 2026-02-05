import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order:{ type: mongoose.Schema.Types.ObjectId, 
         required: true },
         paymentId:{
            type:String,
            
         },
         status:{
            type:String,
            required:true   
         },
         // this order id is generated from payment gateway
         orderId:{
            type:String,
        },
        signature:{
            type:String,
         },
         status:{
            type:String,
            enum:['pending','completed','failed'],
            default:'pending'
         },
         user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true},
},{
    timestamps:true

})

const paymentModel = mongoose.model('Payment',paymentSchema);

export default paymentModel;