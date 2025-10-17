export interface OtpResult {
    success: boolean;
    message?: string;
    otp?: string;
    expiresAt?: Date;
  }
  
  export interface IOtpService {
    generateOTP(length?: number): string;
    sendVerificationOTP(email: string): Promise<OtpResult>;
    verifyOTP(email: string, providedOTP: string, type: string): Promise<OtpResult>;
    sendPasswordResetOTP(email: string): Promise<OtpResult>;
  }
  