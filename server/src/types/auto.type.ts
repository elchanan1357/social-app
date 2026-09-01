import { UserRole } from "./model.type";
import { Request } from "express";

export interface TokenPayload {
    userId: string;
    role: UserRole;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    user?: TokenPayload;
}