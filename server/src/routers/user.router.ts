import { Router } from "express";
import { AuthController } from "@/controllers/auth.controllers";
import { authTokenMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", authTokenMiddleware, AuthController.logout);

export default router;