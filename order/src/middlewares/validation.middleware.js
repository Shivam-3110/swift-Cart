import {body,validationResult} from 'express-validator';

const respondWithValidationErrors = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}


    
const createOrderValidation = [
    body('shippingAddress.street')
    .isString()
    .withMessage('Street must be a string')
    .notEmpty()
    .withMessage('city is required'),
    body('shippingAddress.state')
    .isString()
    .withMessage('state must be a string')
    .notEmpty()
    .withMessage('state is required'),
     body('shippingAddress.city')
    .isString()
    .withMessage('city must be a string')
    .notEmpty()
    .withMessage('city is required'),
     body('shippingAddress.pincode')
    .isString()
    .withMessage('pincode must be a string')
    .notEmpty()
    .withMessage('pincode is required'),
       body('shippingAddress.country')
    .isString()
    .withMessage('country must be a string')
    .notEmpty()
    .withMessage('country is required'),
       body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
    respondWithValidationErrors
]


export default {createOrderValidation} ;