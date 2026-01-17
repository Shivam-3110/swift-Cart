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
const updateAddressValidation = [
    body('shippingAddress.street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street cannot be empty'),
    body('shippingAddress.city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City cannot be empty'),
    body('shippingAddress.state')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State cannot be empty'),
    body('shippingAddress.pincode')
        .isString()
        .withMessage('Pincode must be a string')
        .notEmpty()
        .withMessage('Pincode cannot be empty')
        .bail()
        .matches(/^\d{4,}$/)
        .withMessage('Pincode must be at least 4 digits'),
    body('shippingAddress.country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country cannot be empty'),
    respondWithValidationErrors
]


export default {createOrderValidation, updateAddressValidation}; ;