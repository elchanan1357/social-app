import dotenv from 'dotenv'
import { z } from 'zod'
import type { SignOptions } from 'jsonwebtoken'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  MONGO_URI: z.string().min(1).default('mongodb://localhost:27017/social_app'),
  CLIENT_URL: z.string().min(1).default('http://localhost:5173'),

  JWT_SECRET: z.string().min(1),
  JWT_RESET_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),
  JWT_RESET_EXPIRES_IN: z.string().min(1).default('10m'),

  BREVO_API_KEY: z.string().min(1),
  MAIL_FROM: z.string().min(1),

  OTP_EXPIRES_MINUTES: z.coerce.number().int().positive().default(10),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid environment variables:\n${details}`)
}

const env = parsed.data

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  mongo_uri: env.MONGO_URI,
  clientUrl: env.CLIENT_URL,

  jwtSecret: env.JWT_SECRET,
  jwtResetSecret: env.JWT_RESET_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  jwtResetExpiresIn: env.JWT_RESET_EXPIRES_IN as SignOptions['expiresIn'],


  mail: {
    apiKey: env.BREVO_API_KEY,
    from: env.MAIL_FROM,
  },

  otpExpiresMinutes: env.OTP_EXPIRES_MINUTES,
}

export type Config = typeof config