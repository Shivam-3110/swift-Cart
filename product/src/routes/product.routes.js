import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import productController from '../controllers/product.controller.js';
import validators from '../validators/product.validator.js';
import multer from 'multer';
const router = express.Router();

const upload = multer({ storage:multer.memoryStorage()});

router.post('/',createAuthMiddleware(['admin','seller']), upload.array('image',5),validators.createProductValidators,productController.createProduct);

export default router;


