import { CookieOptions } from 'express';
import { config } from '@/utils/config';

const isProd = config.nodeEnv === 'production';

export const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
};

export const refreshTokenCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};