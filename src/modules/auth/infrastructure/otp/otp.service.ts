import { Injectable, Inject } from '@nestjs/common';
import { IOtpService, OtpResult } from '../../domain/services/otp.service.interface';
import { IOtpRepository } from '../../domain/repositories/otp.repository.interface';

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    @Inject('OTP_REPOSITORY')
    private readonly otpRepository: IOtpRepository,
    // Inject email service here
  ) {}

  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  async sendVerificationOTP(email: string): Promise<OtpResult> {
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    await this.otpRepository.create({
      email,
      otpCode: otp,
      type: 'email_verification',
      expiresAt,
      used: false,
    });

    // TODO: Send email with OTP
    // await this.emailService.send(email, 'Verification Code', otp);

    return {
      success: true,
      message: 'Verification code sent successfully',
      expiresAt,
    };
  }

  async sendPasswordResetOTP(email: string): Promise<OtpResult> {
    const otp = this.generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.otpRepository.create({
      email,
      otpCode: otp,
      type: 'password_reset',
      expiresAt,
      used: false,
    });

    // TODO: Send email with OTP
    // await this.emailService.send(email, 'Password Reset Code', otp);

    return {
      success: true,
      message: 'Password reset code sent successfully',
      expiresAt,
    };
  }

  async verifyOTP(email: string, providedOTP: string, type: string): Promise<OtpResult> {
    const otpRecord = await this.otpRepository.findByEmailAndType(email, type);

    if (!otpRecord) {
      return {
        success: false,
        message: 'No OTP found for this email',
      };
    }

    if (otpRecord.used) {
      return {
        success: false,
        message: 'OTP has already been used',
      };
    }

    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        message: 'OTP has expired',
      };
    }

    if (otpRecord.otpCode !== providedOTP) {
      return {
        success: false,
        message: 'Invalid OTP',
      };
    }

    await this.otpRepository.markAsUsed(otpRecord.id);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }
}