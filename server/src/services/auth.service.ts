import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/utils/config";
import { UserModel } from "@/types/model.type";
import { TokenPayload, AuthTokens } from "@/types/auto.type";
import { UserRepository } from "@/repo/user.repo";
import { AppError } from "@/utils/appError";
import crypto from 'crypto'
import { sendOtpEmail } from './mail.service'
import type { OAuthProfile } from '@/types/oauth.type'

export class AuthService {
    private static SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }

    static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    static generateTokens(payload: TokenPayload): AuthTokens {
        const accessToken = jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtAccessExpiresIn,
        });
        const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
            expiresIn: config.jwtRefreshExpiresIn,
        });

        return { accessToken, refreshToken };
    }

    private static hashOtp(code: string): string {
        return crypto.createHash('sha256').update(code).digest('hex');
    }


    static async register(userData: Partial<UserModel> & { password: string }) {
        const findUser = await UserRepository.findByEmail(userData.email!);
        if (findUser)
            throw new AppError('User with this email already exists', 400);

        const hashedPassword = await this.hashPassword(userData.password);
        const newUser = await UserRepository.create({
            ...userData,
            passwordHash: hashedPassword,
        });
        const tokens = this.generateTokens({
            userId: newUser._id.toString(),
            role: newUser.role
        });

        await UserRepository.addRefreshToken(newUser._id.toString(), tokens.refreshToken);
        return { user: newUser, tokens };
    }

    static async login(email: string, password: string) {
        const user = await UserRepository.findByEmailWithPassword(email);
        if (!user)
            throw new AppError('User not found', 400);

        if (!user.passwordHash)
            throw new AppError('This account uses Google or Facebook sign-in', 400);

        const isMatch = await this.comparePasswords(password, user.passwordHash);
        if (!isMatch)
            throw new AppError('Invalid email or password', 401);

        const tokens = this.generateTokens({
            userId: user._id.toString(),
            role: user.role
        });

        await UserRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);
        return { user, tokens };
    }

    static async socialLogin(profile: OAuthProfile) {
        let user = await UserRepository.findByProviderId(profile.provider, profile.providerId);

        if (!user) {
            if (!profile.email)
                throw new AppError('Your account did not provide an email address', 400);

            const existing = await UserRepository.findByEmail(profile.email);
            if (existing) {
                if (!profile.emailVerified)
                    throw new AppError(
                        'An account with this email already exists. Please sign in with your password',
                        409
                    );
                user = await UserRepository.linkProvider(
                    existing._id.toString(),
                    profile.provider,
                    profile.providerId
                );
            } else {
                user = await UserRepository.createSocialUser({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    picture: profile.picture,
                    provider: profile.provider,
                    providerId: profile.providerId,
                });
            }
        }

        if (!user) throw new AppError('Social sign-in failed', 500);

        const tokens = this.generateTokens({
            userId: user._id.toString(),
            role: user.role,
        });
        await UserRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);
        return { user, tokens };
    }

    static async getMe(userId: string) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }

    static async forgotPassword(email: string) {
        const user = await UserRepository.findByEmail(email)

        if (!user)
            throw new AppError('This email is not registered. Please sign up first.', 404);

        const otp = crypto.randomInt(100000, 999999).toString()
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await UserRepository.saveResetOtp(user.id, otpHash, expiresAt)
        await sendOtpEmail(email, otp)
    }

    static async verifyOtp(email: string, code: string): Promise<string> {
        const user = await UserRepository.findByEmailWithOtp(email);
        if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
            throw new AppError('Invalid or expired OTP code', 400);
        }

        const userId = user._id.toString();

        if (new Date() > new Date(user.resetOtpExpiresAt)) {
            await UserRepository.clearOtpData(userId);
            throw new AppError('OTP code expired, please request a new one', 400);
        }

        if ((user.resetOtpAttempts || 0) >= 5) {
            await UserRepository.clearOtpData(userId);
            throw new AppError('Too many failed attempts. OTP code has been revoked', 429);
        }

        const incoming = Buffer.from(this.hashOtp(code), 'hex');
        const stored = Buffer.from(user.resetOtpHash, 'hex');
        const isMatch = incoming.length === stored.length && crypto.timingSafeEqual(incoming, stored);

        if (!isMatch) {
            const attempts = await UserRepository.incrementOtpAttempts(userId);
            if (attempts >= 5) {
                await UserRepository.clearOtpData(userId);
                throw new AppError('Too many failed attempts. OTP code has been revoked', 429);
            }
            throw new AppError(`Invalid code. ${5 - attempts} attempts remaining`, 400);
        }

        return jwt.sign(
            { sub: userId, email: user.email, purpose: 'password_reset' },
            config.jwtResetSecret,
            { expiresIn: config.jwtResetExpiresIn }
        );
    }

    static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
        let payload: jwt.JwtPayload;
        try {
            payload = jwt.verify(resetToken, config.jwtResetSecret) as jwt.JwtPayload;
        } catch {
            throw new AppError('Invalid or expired reset token', 401);
        }

        if (payload.purpose !== 'password_reset' || !payload.sub || !payload.email) {
            throw new AppError('Unauthorized token purpose', 403);
        }

        const user = await UserRepository.findByEmailWithOtp(payload.email);
        if (!user || user._id.toString() !== payload.sub || !user.resetOtpHash) {
            throw new AppError('Invalid or expired reset token', 401);
        }

        const passwordHash = await this.hashPassword(newPassword);
        await UserRepository.updatePasswordAndClearSessions(payload.sub, passwordHash);
    }

    static async refresh(refreshToken: string) {
        let decoded: TokenPayload;
        try {
            decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as TokenPayload;
        } catch {
            throw new AppError('Invalid or expired refresh token', 401);
        }

        const user = await UserRepository.findById(decoded.userId);
        if (!user)
            throw new AppError('User not found', 400);

        const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
        if (!tokenExists)
            throw new AppError('Invalid or expired refresh token', 401);

        const { accessToken } = this.generateTokens({
            userId: user._id.toString(),
            role: user.role
        });
        return { accessToken };
    }

    static async logout(userId: string, refreshToken: string) {
        await UserRepository.removeRefreshToken(userId, refreshToken);
    }
}