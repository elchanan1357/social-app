import { Resend } from 'resend';
import { config } from '@/utils/config';
import { logger } from '@/utils/logger';

const resend = new Resend(config.mail.apiKey);

export async function sendOtpEmail(to: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: config.mail.from, 
      to,
      subject: 'Your password reset code',
      text: `Your verification code is: ${otp}. It expires in ${config.otpExpiresMinutes} minutes.`,
      html: `<p>Your verification code is: <b>${otp}</b></p><p>It expires in ${config.otpExpiresMinutes} minutes.</p>`,
    });

    if (error) {
      logger.error('Resend failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    logger.info(`OTP email sent successfully to ${to}, ID: ${data?.id}`);
    return data;
  } catch (err: any) {
    logger.error('Error sending OTP email via Resend:', err.message || err);
    throw err;
  }
}