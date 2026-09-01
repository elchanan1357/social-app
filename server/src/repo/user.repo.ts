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
}