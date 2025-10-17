export interface EmailResult {
    success: boolean;
    message?: string;
    errorCode?: string;
    data?: any;
  }
  
  export interface IEmailService {
    sendVerificationEmail(
      email: string,
      subject: string,
      htmlContent: string,
    ): Promise<EmailResult>;
  }