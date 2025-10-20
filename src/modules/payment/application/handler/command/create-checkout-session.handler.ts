import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { CreateCheckoutSessionCommand } from '../../command/create-checkout-session.command';
import { CreatePaymentUseCase } from '../../use-case/create-payment.use-case';
import { CREATE_PAYMENT_USE_CASE, PAYMENT_GATEWAY_FACTORY } from '../../../payment.tokens';
import { PaymentGatewayFactory } from '../../../infrastructure/gateway/payment-gateway.factory';
import { CheckoutSessionResult } from '../../../infrastructure/gateway/payment-gateway.interface';

@CommandHandler(CreateCheckoutSessionCommand)
export class CreateCheckoutSessionHandler
  implements ICommandHandler<CreateCheckoutSessionCommand>
{
  constructor(
    @Inject(CREATE_PAYMENT_USE_CASE)
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    @Inject(PAYMENT_GATEWAY_FACTORY)
    private readonly gatewayFactory: PaymentGatewayFactory,
  ) {}

  async execute(
    command: CreateCheckoutSessionCommand,
  ): Promise<CheckoutSessionResult> {
    try {
      // Get the appropriate payment gateway

      
      const gateway = this.gatewayFactory.getGateway(command.method);

      // Create checkout session with gateway
      const session = await gateway.createCheckoutSession({
        amount: command.amount,
        currency: command.currency,
        customerEmail: command.email,
        metadata: {
          userId: command.userId,
        },
      });

      if (!session.url) {
        throw new BadRequestException('Failed to create checkout session');
      }

      // Save pending payment to database
      await this.createPaymentUseCase.execute({
        userId: command.userId,
        amount: command.amount,
        currency: command.currency,
        method: command.method,
        stripeSessionId: session.id,
      });

      return session;
    } catch (error: any) {
      console.error('❌ Create checkout session error:', error);
      throw new BadRequestException(
        error.message || 'Failed to create checkout session',
      );
    }
  }
}
