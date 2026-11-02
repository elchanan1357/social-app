import { UserModel } from "@/types/model.type";
import { User } from "@/models/user.model";

export class UserRepository {
    static async findByEmail(email: string) {
        return User.findOne({ email });
    }

    static async findById(id: string) {
        return User.findById(id);
    }

    static async findByEmailWithPassword(email: string) {
        return User.findOne({ email }).select("+passwordHash");
    }

    static async create(userData: Partial<UserModel> & { passwordHash: string }) {
        const newUser = new User({
            ...userData,
            refreshTokens: [],
        });
        await newUser.save();
        return newUser;
    }

    static async addRefreshToken(userId: string, refreshToken: string) {
        await User.updateOne(
            { _id: userId },
            {
                $push:
                {
                    refreshTokens:
                    {
                        token: refreshToken,
                        createdAt: new Date()
                    }
                }
            }
        );
    }

    static async removeRefreshToken(userId: string, refreshToken: string) {
        await User.findByIdAndUpdate(
            userId,
            { $pull: { refreshTokens: { token: refreshToken } } },
            { new: true }
        );
    }


    static async saveResetOtp(userId: string, otpHash: string, expiresAt: Date) {
        await User.updateOne(
            { _id: userId },
            { $set: { resetOtpHash: otpHash, resetOtpExpiresAt: expiresAt, resetOtpAttempts: 0 } }
        );
    }

    static async findByEmailWithOtp(email: string) {
        return User.findOne({ email }).select("+resetOtpHash +resetOtpExpiresAt +resetOtpAttempts");
    }

    static async incrementOtpAttempts(userId: string) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { resetOtpAttempts: 1 } },
            { new: true }
        );
        return user?.resetOtpAttempts || 0;
    }

    static async clearOtpData(userId: string) {
        await User.findByIdAndUpdate(userId, {
            $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1 },
            $set: { resetOtpAttempts: 0 },
        });
    }

    static async updatePasswordAndClearSessions(userId: string, newPasswordHash: string) {
        await User.findByIdAndUpdate(userId, {
            $set: {
                passwordHash: newPasswordHash,
                resetOtpAttempts: 0,
                refreshTokens: [],
            },
            $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1 },
        });
    }
}