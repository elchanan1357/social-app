import crypto from 'crypto';
import { config } from '@/utils/config';
import { AppError } from '@/utils/appError';
import type { OAuthProfile, OAuthProvider } from '@/types/oauth.type';

const FACEBOOK_API_VERSION = 'v26.0';
const FACEBOOK_API = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

const callbackUrl = (provider: OAuthProvider) =>
    `${config.oauth.serverUrl}/api/auth/${provider}/callback`;

const notConfigured = (name: string) => new AppError(`${name} sign-in is not configured`, 503);
const failed = (name: string) => new AppError(`${name} sign-in failed. Please try again`, 401);

export class OAuthService {
    static createState(): string {
        return crypto.randomBytes(24).toString('hex');
    }

    static getAuthUrl(provider: OAuthProvider, state: string): string {
        if (provider === 'google') {
            const { clientId } = config.oauth.google;
            if (!clientId) throw notConfigured('Google');

            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: callbackUrl('google'),
                response_type: 'code',
                scope: 'openid email profile',
                state,
                prompt: 'select_account',
            });
            return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
        }

        const { appId } = config.oauth.facebook;
        if (!appId) throw notConfigured('Facebook');

        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: callbackUrl('facebook'),
            response_type: 'code',
            scope: 'public_profile,email',
            state,
        });
        return `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?${params}`;
    }

    static async getProfile(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
        return provider === 'google'
            ? this.getGoogleProfile(code)
            : this.getFacebookProfile(code);
    }

    private static async getGoogleProfile(code: string): Promise<OAuthProfile> {
        const { clientId, clientSecret } = config.oauth.google;
        if (!clientId || !clientSecret) throw notConfigured('Google');

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: callbackUrl('google'),
                grant_type: 'authorization_code',
            }),
        });
        if (!tokenRes.ok) throw failed('Google');
        const { access_token } = (await tokenRes.json()) as { access_token: string };

        const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!profileRes.ok) throw failed('Google');
        const profile = (await profileRes.json()) as {
            sub: string;
            email?: string;
            email_verified?: boolean;
            given_name?: string;
            family_name?: string;
            name?: string;
            picture?: string;
        };

        return {
            provider: 'google',
            providerId: profile.sub,
            email: profile.email?.toLowerCase() ?? null,
            emailVerified: profile.email_verified === true,
            firstName: profile.given_name || profile.name || 'User',
            lastName: profile.family_name || '-',
            picture: profile.picture ?? '',
        };
    }

    private static async getFacebookProfile(code: string): Promise<OAuthProfile> {
        const { appId, appSecret } = config.oauth.facebook;
        if (!appId || !appSecret) throw notConfigured('Facebook');

        const tokenParams = new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            redirect_uri: callbackUrl('facebook'),
            code,
        });
        const tokenRes = await fetch(`${FACEBOOK_API}/oauth/access_token?${tokenParams}`);
        if (!tokenRes.ok) throw failed('Facebook');
        const { access_token } = (await tokenRes.json()) as { access_token: string };

        const profileParams = new URLSearchParams({
            fields: 'id,first_name,last_name,email,picture.width(200)',
            access_token,
        });
        const profileRes = await fetch(`${FACEBOOK_API}/me?${profileParams}`);
        if (!profileRes.ok) throw failed('Facebook');
        const profile = (await profileRes.json()) as {
            id: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            picture?: { data?: { url?: string } };
        };

        return {
            provider: 'facebook',
            providerId: profile.id,
            email: profile.email?.toLowerCase() ?? null,
            emailVerified: false,
            firstName: profile.first_name || 'User',
            lastName: profile.last_name || '-',
            picture: profile.picture?.data?.url ?? '',
        };
    }
}