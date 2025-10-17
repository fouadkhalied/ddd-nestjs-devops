import { Injectable, Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { isNone } from 'effect/Option';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { PaymentRepository } from '../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY, PAYMENT_GATEWAY_FACTORY } from '../../payment.tokens';
import { PaymentGatewayFactory } from '../../infrastructure/gateway/payment-gateway.factory';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';
import { PaymentStatus } from '../../domain/value-object/payment-status.enum';

export interface ProcessWebhookInput {
  payload: any;
  method: PaymentMethod;
  signature?: string;
}

@Injectable()
export class ProcessWebhookUseCase implements UseCase<ProcessWebhookInput, void> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_GATEWAY_FACTORY)
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly eventPublisher: EventPublisher,
  ) {
    this.setupWebhookHandlers();
  }

  async execute(input: ProcessWebhookInput): Promise<void> {
    const gateway = this.gatewayFactory.getGateway(input.method);
    await gateway.processWebhook(input.payload) //input.signature);
  }

  private setupWebhookHandlers(): void {
    // Setup Paymob handlers
    const paymobGateway = this.gatewayFactory.getGateway(PaymentMethod.PAYMOB);
    
    paymobGateway.onWebhookEvent(
      'checkout.session.completed',
      async (event) => {
        await this.handleCheckoutCompleted(event.data.object);
      },
    );

    paymobGateway.onWebhookEvent(
      'payment_intent.payment_failed',
      async (event) => {
        await this.handlePaymentFailed(event.data.object);
      },
    );

    // Setup Stripe handlers
    const stripeGateway = this.gatewayFactory.getGateway(PaymentMethod.STRIPE);
    
    stripeGateway.onWebhookEvent(
      'checkout.session.completed',
      async (event) => {
        await this.handleCheckoutCompleted(event.data.object);
      },
    );

    stripeGateway.onWebhookEvent(
      'payment_intent.payment_failed',
      async (event) => {
        await this.handlePaymentFailed(event.data.object);
      },
    );

    console.log('✅ Webhook handlers registered for all payment gateways');
  }

  private async handleCheckoutCompleted(sessionData: any): Promise<void> {
    try {
      console.log('🎯 Payment completed webhook received');

      // Get payment from database
      const paymentOption = await this.paymentRepository.findPaymentBySessionId(
        sessionData.id,
      );

      if (isNone(paymentOption)) {
        throw new Error(
          `No pending payment found for session: ${sessionData.id}`,
        );
      }

      const payment = paymentOption.value;

      // Check if already processed
      if (payment.props.status === PaymentStatus.COMPLETED) {
        console.log('⚠️ Already processed, skipping:', sessionData.id);
        return;
      }

      // Merge with event publisher
      this.eventPublisher.mergeObjectContext(payment);

      // Mark as completed (this will trigger balance update in repository)
      payment.complete();

      // Update in database
      await this.paymentRepository.updatePaymentStatus(
        sessionData.id,
        PaymentStatus.COMPLETED,
      );

      // Commit domain events
      payment.commit();

      console.log('✅ Payment completed successfully:', {
        userId: payment.props.userId,
        amount: payment.props.amount,
      });
    } catch (error) {
      console.error('❌ Error handling checkout completed:', error);
      throw error;
    }
  }

  private async handlePaymentFailed(sessionData: any): Promise<void> {
    try {
      console.log('❌ Payment failed webhook received');

      const sessionId = sessionData.id;
      if (sessionId) {
        await this.paymentRepository.updatePaymentStatus(
          sessionId,
          PaymentStatus.FAILED,
        );
        console.log('❌ Payment marked as failed:', sessionId);
      }
    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
    }
  }
}