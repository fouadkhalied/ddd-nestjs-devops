import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { VerifyPaymentCommand } from '../../command/verify-payment.command';
import { PAYMENT_GATEWAY_FACTORY } from '../../../payment.tokens';
import { PaymentGatewayFactory } from '../../../infrastructure/gateway/payment-gateway.factory';
import { VerifyPaymentResult } from '../../../infrastructure/gateway/payment-gateway.interface';

@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler
  implements ICommandHandler<VerifyPaymentCommand>
{
  constructor(
    @Inject(PAYMENT_GATEWAY_FACTORY)
    private readonly gatewayFactory: PaymentGatewayFactory,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<VerifyPaymentResult> {
    try {
      const gateway = this.gatewayFactory.getGateway(command.method);
      const result = await gateway.verifyPayment(command.orderId);
      return result;
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        paymentStatus: 'unpaid',
      };
    }
  }
}
