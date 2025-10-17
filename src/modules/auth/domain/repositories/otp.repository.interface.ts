export interface OtpRecord {
  id: string;
  otpCode: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  used: boolean;
  email: string;
  createdAt: Date;
}

export interface IOtpRepository {
  create(data: Omit<OtpRecord, 'id' | 'createdAt'>): Promise<OtpRecord>;
  findByEmailAndType(email: string, type: string): Promise<OtpRecord | null>;
  markAsUsed(id: string): Promise<void>;
  deleteByEmail(email: string, type: string): Promise<boolean>;
}
