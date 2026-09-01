import { UserModel, UserRole } from "@/types/model.type";
import { Schema, model } from "mongoose";

const userSchema = new Schema<UserModel>(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
            select: false,
        },
        age: {
            type: Number,
            min: [16, 'Age must be at least 16'],
        },
        picture: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
            maxLength: 300,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: [UserRole.USER, UserRole.ADMIN],
            default: UserRole.USER,
        },
        refreshTokens: [
            {
                token: { type: String, required: true },
                createdAt: { type: Date, default: Date.now, expires: '7d' }
            }
        ]
    },
    {
        timestamps: true,
    }
);

export const User = model<UserModel>('User', userSchema);