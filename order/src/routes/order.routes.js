import express from "express";
import orderController from "../controllers/order.controller.js";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import validation from "../middlewares/validation.middleware.js";
const router = express.Router();

router.post("/", createAuthMiddleware([ "user" ]), validation.createOrderValidation, orderController.createOrder)



export default router;
