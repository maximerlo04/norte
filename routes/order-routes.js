import { OrderModels } from "../models/order.js";
import { orderController } from "../controllers/order-controler.js";
import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/auth-middleware.js";


export const orderRoutes = Router()

const OrderController = new orderController({orderModel: OrderModels})

orderRoutes.post('/', authMiddleware, OrderController.create);
orderRoutes.get('/', OrderController.showMine)
orderRoutes.patch('/orders/:id', authMiddleware, adminMiddleware, OrderController.statusUpdate)