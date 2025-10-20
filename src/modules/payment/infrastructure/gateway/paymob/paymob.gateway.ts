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
  private readonly baseUrl = 'https://ksa.paymob.com/api';

  constructor(private readonly config: PaymobConfig) {
    console.log('🔧 Paymob Gateway initialized:', {
      hasApiKey: !!this.config.apiKey,
      hasIntegrationId: !!this.config.integrationId,
      hasIframeId: !!this.config.iframeId,
      baseUrl: this.baseUrl,
    });
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    customerEmail: string;
    metadata: Record<string, any>;
  }): Promise<CheckoutSessionResult> {
    try {
      console.log('📝 Creating Paymob session:', params);

      // Step 1: Authenticate
      const authToken = await this.authenticate();
      console.log('✅ Authentication successful');

      // Step 2: Create order
      const orderId = await this.createOrder(authToken, params.amount, params.currency);
      console.log('✅ Order created:', orderId);

      // Step 3: Generate payment key
      const paymentKey = await this.generatePaymentKey(
        authToken,
        orderId,
        params.amount,
        params.currency,
        params.customerEmail,
        params.metadata,
      );
      console.log('✅ Payment key generated');

      // Step 4: Return iframe URL
      const iframeUrl = `https://ksa.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;

      return {
        url: iframeUrl,
        id: orderId.toString(),
      };
    } catch (error: any) {
      console.error('❌ Paymob checkout session error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Paymob Error: ${error.message}`);
    }
  }

  private async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: this.config.apiKey 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Auth error:', errorData);
        throw new Error(`Authentication failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token received from Paymob');
      }

      return data.token;
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  private async createOrder(
    authToken: string, 
    amount: number, 
    currency: string
  ): Promise<number> {
    try {
      const amountCents = Math.round(amount * 100);

      const payload = {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: currency,
        items: [],
      };

      console.log('📦 Creating order with payload:', payload);

      const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Order creation error:', errorData);
        throw new Error(`Order creation failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.id) {
        throw new Error('No order ID received from Paymob');
      }

      return data.id;
    } catch (error: any) {
      console.error('❌ Order creation error:', error);
      throw error;
    }
  }

  private async generatePaymentKey(
    authToken: string,
    orderId: number,
    amount: number,
    currency: string,
    email: string,
    metadata: Record<string, any>,
  ): Promise<string> {
    try {
      const amountCents = Math.round(amount * 100);

      const payload = {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          email: email,
          first_name: metadata.firstName || 'Customer',
          last_name: metadata.lastName || 'User',
          phone_number: metadata.phone || '+966500000000',
          apartment: 'NA',
          floor: 'NA',
          street: 'NA',
          building: 'NA',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Riyadh',
          country: 'SA',
          state: 'Riyadh',
        },
        currency: currency,
        integration_id: parseInt(this.config.integrationId),
        lock_order_when_paid: true,
      };

      console.log('🔑 Generating payment key with payload:', {
        ...payload,
        auth_token: '***',
      });

      const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = errorText;
        }
        console.error('❌ Payment key error:', {
          status: response.status,
          data: errorData,
        });
        throw new Error(`Payment key generation failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No payment token received from Paymob');
      }

      return data.token;
    } catch (error: any) {
      console.error('❌ Payment key generation error:', error);
      throw error;
    }
  }

  async verifyPayment(orderId: string): Promise<VerifyPaymentResult> {
    try {
      await this.authenticate();
      
      const response = await fetch(
        `${this.baseUrl}/ecommerce/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        console.error('❌ Payment verification failed:', response.status);
        return {
          success: false,
          paymentStatus: 'unpaid',
        };
      }

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
      console.log('📨 Processing Paymob webhook:', {
        type: payload.type,
        obj: payload.obj?.order?.id,
      });

      // Determine event type based on payload
      const eventType = this.determineEventType(payload);

      // Get handler for this event type
      const handler = this.webhookHandlers.get(eventType);

      if (handler) {
        await handler({
          type: eventType,
          data: { object: payload },
        });
      } else {
        console.log('⚠️ No handler for event type:', eventType);
      }
    } catch (error) {
      console.error('❌ Paymob webhook processing error:', error);
      throw error;
    }
  }

  private determineEventType(payload: any): string {
    // Paymob webhook structure
    if (payload.type === 'TRANSACTION') {
      if (payload.obj?.success === true || payload.obj?.success === 'true') {
        return 'checkout.session.completed';
      }
      return 'payment_intent.payment_failed';
    }
    
    // Fallback for other structures
    if (payload.success === true || payload.success === 'true') {
      return 'checkout.session.completed';
    }
    
    return 'payment_intent.payment_failed';
  }

  onWebhookEvent(eventType: string, handler: (event: any) => Promise<void>): void {
    this.webhookHandlers.set(eventType, handler);
    console.log(`✅ Webhook handler registered for: ${eventType}`);
  }
}