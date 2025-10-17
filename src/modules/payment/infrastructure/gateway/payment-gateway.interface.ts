export interface CheckoutSessionResult {
    url: string;
    id: string;
  }
  
  export interface VerifyPaymentResult {
    success: boolean;
    paymentStatus: 'paid' | 'unpaid';
    amountTotal?: number;
    currency?: string;
    metadata?: any;
  }
  
  export interface IPaymentGateway {
    createCheckoutSession(params: {
      amount: number;
      currency: string;
      customerEmail: string;
      metadata: Record<string, any>;
    }): Promise<CheckoutSessionResult>;
  
    processWebhook(payload: any): Promise<void>;
  
    verifyPayment(orderId: string): Promise<VerifyPaymentResult>;
  
    onWebhookEvent(eventType: string, handler: (event: any) => Promise<void>): void;
  }