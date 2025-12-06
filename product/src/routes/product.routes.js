import express from 'express';
import createAuthMiddleware from '../middlewares/auth.middleware.js';
import productController from '../controllers/product.controller.js';
const router = express.Router();

const upload = multer({ storage:multer.memoryStorage()});

router.post('/',createAuthMiddleware(['admin','seller']), upload.aaray('image',5), productController.createProduct);

export default router;


