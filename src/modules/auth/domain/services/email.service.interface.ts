export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }
  
  export interface IEmailService {
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendVerificationEmail(email: string, otp: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, otp: string): Promise<boolean>;
  }