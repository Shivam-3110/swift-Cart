import express from 'express';
import { createAuthMiddleware } from'../middleware/auth.middleware.js';
import controller from "../controllers/seller.controller.js";

const router = express.Router();



router.get("/metrics", createAuthMiddleware([ "seller" ]), controller.getMetrics)

router.get("/orders", createAuthMiddleware([ "seller" ]), controller.getOrders)

router.get("/products", createAuthMiddleware([ "seller" ]), controller.getProducts)


export default router;
