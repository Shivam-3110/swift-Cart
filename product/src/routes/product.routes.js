import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import productController from '../controllers/product.controller.js';
import validators from '../validators/product.validator.js';
import multer from 'multer';
const router = express.Router();

const upload = multer({ storage:multer.memoryStorage()});
//sellers api
router.post('/',createAuthMiddleware(['admin','seller']), upload.array('images',5),validators.createProductValidators,productController.createProduct);
//get product by search
router.get('/',productController.getProducts)
//get products /id
router.get('/:id',productController.getProductById);

export default router;


