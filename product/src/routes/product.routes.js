import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import productController from '../controllers/product.controller.js';
import validators from '../validators/product.validator.js';
import multer from 'multer';
const router = express.Router();

const upload = multer({ storage:multer.memoryStorage()});
//sellers api
router.post('/',createAuthMiddleware(['admin','seller']), upload.array('images',5),validators.createProductValidators,productController.createProduct);

//get products /id
router.get('/:id',productController.getProductById);

router.patch("/:id",createAuthMiddleware(["seller"]),productController.updateProduct);

router.delete('/:id',createAuthMiddleware(["seller"]),productController.deleteProduct);

router.get("/seller", createAuthMiddleware(["seller"]), productController.getProductsBySeller);

//get product by search
router.get('/',productController.getProducts);

export default router;


