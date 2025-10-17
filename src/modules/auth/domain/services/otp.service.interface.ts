export interface OtpResult {
    success: boolean;
    message?: string;
    otp?: string;
    expiresAt?: Date;
}
  
export interface IOtpService {
    generateOTP(length?: number): string;
    sendOTP(email: string, otp: string): Promise<OtpResult>;
    verifyOTP(email: string, providedOTP: string): Promise<OtpResult>;
    resendOTP(email: string): Promise<OtpResult>;
}