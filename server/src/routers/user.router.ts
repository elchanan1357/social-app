import { Router } from "express";
import { AuthController } from "@/controllers/auth.controllers";
import { authTokenMiddleware } from "@/middlewares/auth.middleware";
import { validate } from '@/middlewares/validate.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from "@/validations/auth.validation";
import { forgotPasswordLimiter, oauthLimiter, verifyOtpLimiter } from "@/middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

router.get('/google', oauthLimiter, AuthController.oauthStart('google'));
router.get('/google/callback', oauthLimiter, AuthController.oauthCallback('google'));
router.get('/facebook', oauthLimiter, AuthController.oauthStart('facebook'));
router.get('/facebook/callback', oauthLimiter, AuthController.oauthCallback('facebook'));

router.get('/me', authTokenMiddleware, AuthController.me); 

router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/verify-otp', verifyOtpLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);
router.post('/reset-password', verifyOtpLimiter, validate(resetPasswordSchema), AuthController.resetPassword);

router.post("/refresh", AuthController.refresh);
router.post("/logout", authTokenMiddleware, AuthController.logout);

export default router;