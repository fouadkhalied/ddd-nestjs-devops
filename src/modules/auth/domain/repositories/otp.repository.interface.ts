export interface OtpRecord {
    id: string;
    otpCode: string;
    type: string;
    expiresAt: Date;
    used: boolean;
    email: string;
    createdAt: Date;
  }
  
  export interface IOtpRepository {
    create(data: Omit<OtpRecord, 'id' | 'createdAt'>): Promise<OtpRecord>;
    findByEmail(email: string): Promise<OtpRecord | null>;
    markAsUsed(id: string): Promise<void>;
    deleteByToken(token: string): Promise<boolean>;
  }