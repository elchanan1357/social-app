import nodemailer from 'nodemailer';
import { config } from '@/utils/config';
import { logger } from '@/utils/logger';

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
        user: config.mail.user,
        pass: config.mail.pass,
    },
});

export async function sendOtpEmail(to: string, otp: string) {
    logger.info('SMTP user:', JSON.stringify(config.mail.user));

    transporter.verify()
        .then(() => logger.info('SMTP connection OK'))
        .catch((err) => logger.error('SMTP verify failed:', err.message));

    await transporter.sendMail({
        from: config.mail.from,
        to,
        subject: 'Your password reset code',
        text: `Your verification code is: ${otp}. It expires in ${config.otpExpiresMinutes} minutes.`,
        html: `<p>Your verification code is: <b>${otp}</b></p><p>It expires in ${config.otpExpiresMinutes} minutes.</p>`,
    });
}