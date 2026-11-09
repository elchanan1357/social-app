import { BrevoClient } from '@getbrevo/brevo';
import { config } from '@/utils/config';
import { logger } from '@/utils/logger';


const brevo = new BrevoClient({
  apiKey: config.mail.apiKey,
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: 'Your password reset code',
      htmlContent: `<p>Your verification code is: <b>${otp}</b></p><p>It expires in ${config.otpExpiresMinutes} minutes.</p>`,
      textContent: `Your verification code is: ${otp}. It expires in ${config.otpExpiresMinutes} minutes.`,
      sender: { name: 'SocialApp', email: config.mail.from },
      to: [{ email: to }],
    });

    logger.info(`OTP email sent successfully via Brevo to ${to}`);
  } catch (error: any) {
    logger.error('Brevo API Error:', error.body || error.message || error);
    throw new Error('Failed to send verification email');
  }
}