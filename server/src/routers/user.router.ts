import { Router } from "express";
import { AuthController } from "@/controllers/auth.controllers";
import { authTokenMiddleware } from "@/middlewares/auth.middleware";
import { validate } from '@/middlewares/validate.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/validations/auth.validation";

import { forgotPasswordLimiter } from "@/middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);

router.post("/refresh", AuthController.refresh);
router.post("/logout", authTokenMiddleware, AuthController.logout);

export default router;