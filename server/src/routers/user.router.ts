import { Router } from "express";
import { AuthController } from "@/controllers/auth.controllers";
import { authTokenMiddleware } from "@/middlewares/auth.middleware";
import { validate } from '@/middlewares/validate.middleware';
import { loginSchema, registerSchema } from "@/validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authTokenMiddleware, AuthController.logout);

export default router;