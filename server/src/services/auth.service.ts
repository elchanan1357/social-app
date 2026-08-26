import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/utils/config";
import { UserModel } from "@/types/model.type";
import { logger } from "@/utils/logger";
import { TokenPayload, AuthTokens } from "@/types/auto.type";
import { UserRepository } from "@/repo/user.repo";

export class AuthService {
    private static SALT_ROUNDS = 10;

    static async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            logger.error("Error hashing password:", error);
            throw new Error("Error hashing password");
        }
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

    static async register(userData: Partial<UserModel> & { password: string }) {
        try {
            const findUser = await UserRepository.findByEmail(userData.email!);
            if (findUser)
                throw new Error("User with this email already exists");

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
        } catch (error) {
            logger.error("Error registering user: ", error);
            throw error;
        }
    }

    static async login(email: string, password: string) {
        try {
            const user = await UserRepository.findByEmailWithPassword(email);
            if (!user)
                throw new Error("User not found");

            const isMatch = await this.comparePasswords(password, user.passwordHash);
            if (!isMatch)
                throw new Error("Invalid email or password");

            const tokens = this.generateTokens({
                userId: user._id.toString(),
                role: user.role
            });

            await UserRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);
            return { user, tokens };
        } catch (error) {
            logger.error("Error logging in user: ", error);
            throw error;
        }
    }

    static async refresh(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as TokenPayload;
            const user = await UserRepository.findById(decoded.userId);
            if (!user)
                throw new Error("User not found");

            const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
            if (!tokenExists)
                throw new Error("Invalid refresh token");

            const { accessToken } = this.generateTokens({
                userId: user._id.toString(),
                role: user.role
            });
            return { accessToken };
        } catch (error) {
            logger.error("Error refreshing access token: ", error);
            throw error;
        }
    }

    static async logout(userId: string, refreshToken: string) {
        try {
            await UserRepository.removeRefreshToken(userId, refreshToken);
        } catch (error) {
            logger.error("Error logout user: ", error);
            throw error;
        }
    }
}