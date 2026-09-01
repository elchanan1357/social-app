import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { config } from '@/utils/config';
import { AuthRequest } from '@/types/auto.type';
import { logger } from '@/utils/logger';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        logger.info(`[AUTH] Register request received`);
        try {
            const { user, tokens } = await AuthService.register(req.body);

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            logger.info(`[AUTH] User registered successfully`);

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
                accessToken: tokens.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        logger.info(`[AUTH] Login request received`);
        try {
            const { email, password } = req.body;
            const { user, tokens } = await AuthService.login(email, password);

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            logger.info(`[AUTH] User logged in successfully`);

            res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
                accessToken: tokens.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    static async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        logger.info(`[AUTH] Refresh request received`);
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                logger.warn(`[AUTH] Refresh token missing in request cookies`);
                res.status(401).json({ message: 'Refresh token required' });
                return
            }

            const { accessToken } = await AuthService.refresh(refreshToken);
            logger.info(`[AUTH] Access token refreshed successfully`);

            res.status(200).json({ accessToken });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: AuthRequest, res: Response, next: NextFunction) {
        logger.info(`[AUTH] Logout request received`);
        try {
            const refreshToken = req.cookies?.refreshToken;
            const userId = req.user?.userId;

            if (userId && refreshToken)
                await AuthService.logout(userId, refreshToken);
            else
                logger.warn(`[AUTH] Logout request missing userId or refreshToken`);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: config.nodeEnv === 'production',
                sameSite: 'strict',
            });

            logger.info(`[AUTH] User logged out successfully`);
            res.status(200).json({ message: "User logged out successfully" });
        } catch (error) {
            next(error);
        }
    }
}