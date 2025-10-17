import { Injectable } from '@nestjs/common';
import {
  IPaymentGateway,
  CheckoutSessionResult,
  VerifyPaymentResult,
} from '../payment-gateway.interface';
import { PaymobConfig } from './paymob.types';

@Injectable()
export class PaymobGateway implements IPaymentGateway {
  private webhookHandlers = new Map<string, (event: any) => Promise<void>>();

  constructor(private readonly config: PaymobConfig) {}

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    customerEmail: string;
    metadata: Record<string, any>;
  }): Promise<CheckoutSessionResult> {
    try {
      // Step 1: Authenticate
      const authToken = await this.authenticate();

      // Step 2: Create order
      const orderId = await this.createOrder(authToken, params.amount);

      // Step 3: Generate payment key
      const paymentKey = await this.generatePaymentKey(
        authToken,
        orderId,
        params.amount,
        params.currency,
        params.customerEmail,
        params.metadata,
      );

      // Step 4: Return iframe URL
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      return {
        url: iframeUrl,
        id: orderId.toString(),
      };
    } catch (error) {
      console.error('❌ Paymob checkout session error:', error);
      throw new Error('Failed to create Paymob checkout session');
    }
  }

  private async authenticate(): Promise<string> {
    const response = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: this.config.apiKey }),
    });

    const data = await response.json();
    return data.token;
  }

  private async createOrder(authToken: string, amount: number): Promise<number> {
    const response = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amount * 100,
        currency: 'SAR',
        items: [],
      }),
    });

    const data = await response.json();
    return data.id;
  }

  private async generatePaymentKey(
    authToken: string,
    orderId: number,
    amount: number,
    currency: string,
    email: string,
    metadata: Record<string, any>,
  ): Promise<string> {
    const response = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amount * 100,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          email,
          first_name: 'NA',
          last_name: 'NA',
          phone_number: 'NA',
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'NA',
          state: 'NA',
        },
        currency,
        integration_id: this.config.integrationId,
        lock_order_when_paid: true,
        metadata
      }),
    });

    const data = await response.json();
    return data.token;
  }

  async verifyPayment(orderId: string): Promise<VerifyPaymentResult> {
    try {
      await this.authenticate();
      
      const response = await fetch(
        `https://accept.paymob.com/api/ecommerce/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      const isPaid = data.paid_amount_cents > 0;

      return {
        success: isPaid,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        amountTotal: data.amount_cents,
        currency: data.currency,
        metadata: {},
      };
    } catch (error) {
      console.error('❌ Paymob verify payment error:', error);
      return {
        success: false,
        paymentStatus: 'unpaid',
      };
    }
  }

  async processWebhook(payload: any): Promise<void> {
    try {
      // Validate HMAC signature
     // this.validateHmac(payload);

      // Determine event type based on payload
      const eventType = this.determineEventType(payload);

      // Get handler for this event type
      const handler = this.webhookHandlers.get(eventType);

      if (handler) {
        await handler({
          type: eventType,
          data: { object: payload },
        });
      }
    } catch (error) {
      console.error('❌ Paymob webhook processing error:', error);
      throw error;
    }
  }

  // private validateHmac(payload: any): void {
  //   // Implement HMAC validation logic here
  //   // This is specific to Paymob's webhook security
  // }

  private determineEventType(payload: any): string {
    // Check payload to determine event type
    if (payload.success === true || payload.success === 'true') {
      return 'checkout.session.completed';
    }
    return 'payment_intent.payment_failed';
  }

  onWebhookEvent(eventType: string, handler: (event: any) => Promise<void>): void {
    this.webhookHandlers.set(eventType, handler);
  }
}