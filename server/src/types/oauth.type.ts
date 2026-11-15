export type OAuthProvider = 'google' | 'facebook';

export interface OAuthProfile {
    provider: OAuthProvider;
    providerId: string;
    email: string | null;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    picture: string;
}