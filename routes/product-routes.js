import { Router } from 'express'
import { productController } from '../controllers/product-controller.js'
import { productModel } from '../models/product.js'
import {authMiddleware, adminMiddleware} from '../middlewares/auth-middleware.js'

export const productRouter = Router()

const ProductController = new productController({productModel})

productRouter.get('/catalog', ProductController.showCatalog);
productRouter.get('/products', ProductController.getAll);
productRouter.get('/products/:id', ProductController.getById);
productRouter.post('/products', authMiddleware, adminMiddleware, ProductController.create)
productRouter.patch('/products/:id', authMiddleware, adminMiddleware, ProductController.update)
productRouter.delete('/products/:id',authMiddleware, adminMiddleware, ProductController.delete)
