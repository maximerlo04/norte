import { Router } from "express";
import { AuthController } from "../controllers/auth-controller.js";
import {authMiddleware} from '../middlewares/auth-middleware.js'
import {UserModels} from '../models/user.js'

export const authRouter = Router()

const authController = new AuthController({userModel: UserModels})

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authMiddleware, authController.me);


