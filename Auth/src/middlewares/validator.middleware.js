import {body,validationResult} from 'express-validator';

const respondWithValidationErrors = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();
}

const registerUserValidations = [
    body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({min:3})
    .withMessage("Username must be at least 3 characters long"),
    body("email")
    .isEmail()
    .withMessage("invalid email address"),
    body("password")
    .isLength({min:6})
    .withMessage("password must be at least 6 characters long"),
    body("fullName.firstName")
    .isString()
    .withMessage("First Name must be a string")
    .notEmpty()
    .withMessage("first name must be a String")
    .notEmpty()
    .withMessage("first name is required"),
    body("fullName.lastName")
    .isString()
    .withMessage("last Name must be a string")
    .notEmpty()
    .withMessage("last name must be a String")
    .notEmpty()
    .withMessage("last name is required"),
    respondWithValidationErrors
]

const loginUserValidations = [
    body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
    body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string'),
    body('password')
    .isLength({min:6})
    .withMessage('Password must be at least 6 characters long'),
    (req,res,next)=>{
        if(!req.body.email && !req.body.username){
            return res.status(400).json({message:"Either email or username is required"});
        }
        respondWithValidationErrors(req,res,next);
    }
  
]
export default {registerUserValidations ,respondWithValidationErrors,loginUserValidations} ;