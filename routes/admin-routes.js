import { OrderModels } from "../models/order.js";
import { AdminController } from "../controllers/admin-controller.js";
import { Router } from "express";
import { productModel } from "../models/product.js";

export const adminRoutes = Router()

const adminController = new AdminController({
    productModel: productModel,
    orderModel: OrderModels
})

adminRoutes.get('/', adminController.showPanel)