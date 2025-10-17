import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IPaymentGateway,
  CheckoutSessionResult,
  VerifyPaymentResult,
} from '../payment-gateway.interface';
import { StripeConfig } from './stripe.types';

@Injectable()
export class StripeGateway implements IPaymentGateway {
  private stripe: Stripe;
  private webhookHandlers = new Map<string, (event: any) => Promise<void>>();

  constructor(private readonly config: StripeConfig) {
    this.stripe = new Stripe(this.config.secretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(params: {
    amount: number;
    currency: string;
    customerEmail: string;
    metadata: Record<string, any>;
  }): Promise<CheckoutSessionResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: 'Ad Credit Purchase',
              },
              unit_amount: Math.round(params.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: this.config.successUrl,
        cancel_url: this.config.cancelUrl,
        customer_email: params.customerEmail,
        metadata: params.metadata,
      });

      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error('❌ Stripe checkout session error:', error);
      throw new Error('Failed to create Stripe checkout session');
    }
  }

  async verifyPayment(sessionId: string): Promise<VerifyPaymentResult> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      return {
        success: session.payment_status === 'paid',
        paymentStatus: session.payment_status === 'paid' ? 'paid' : 'unpaid',
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        metadata: session.metadata,
      };
    } catch (error) {
      console.error('❌ Stripe verify payment error:', error);
      return {
        success: false,
        paymentStatus: 'unpaid',
      };
    }
  }

  async processWebhook(payload: any, signature?: string): Promise<void> {
    try {
      let event: Stripe.Event;

      if (signature && this.config.webhookSecret) {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          this.config.webhookSecret,
        );
      } else {
        event = payload as Stripe.Event;
      }

      const handler = this.webhookHandlers.get(event.type);

      if (handler) {
        await handler(event);
      }
    } catch (error) {
      console.error('❌ Stripe webhook processing error:', error);
      throw error;
    }
  }

  onWebhookEvent(eventType: string, handler: (event: any) => Promise<void>): void {
    this.webhookHandlers.set(eventType, handler);
  }
}
