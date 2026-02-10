import express from "express";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(cookieParser());

// Import cart routes
import cartRoutes from "./routes/cart.routes.js";

app.get("/",(req,res) => {
    res.status(200).json({ message: "Cart service is running " })
})  
app.use("/api/cart",cartRoutes);

export default app;