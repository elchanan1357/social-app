import { UserRole } from "./model.type";

export interface TokenPayload {
    userId: string;
    role: UserRole;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}