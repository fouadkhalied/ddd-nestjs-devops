import { Injectable } from '@nestjs/common';
import { EmailOptions, IEmailService } from '../../domain/services/email.service.interface';

@Injectable()
export class EmailService implements IEmailService {
  constructor() {}

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // TODO: Implement with SendGrid, AWS SES, or Nodemailer
    console.log('📧 Sending email:', {
      to: options.to,
      subject: options.subject,
    });
    return true;
  }

  async sendVerificationEmail(email: string, otp: string): Promise<boolean> {
    const subject = 'Verify Your Email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Thank you for registering! Please use the following code to verify your email:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Your verification code is: ${otp}`,
    });
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<boolean> {
    const subject = 'Reset Your Password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Please use the following code:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Your password reset code is: ${otp}`,
    });
  }
}