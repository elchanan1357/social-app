import { Document } from "mongoose";

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

export interface UserModel extends Document {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    age?: number;
    picture?: string;
    bio?: string;
    isActive: boolean;
    role: UserRole;
    refreshTokens: { token: string; createdAt: Date }[];
    createdAt: Date;
    updatedAt: Date;
}