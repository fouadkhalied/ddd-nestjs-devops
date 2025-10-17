import { ICommand } from '@nestjs/cqrs';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';

export class VerifyPaymentCommand implements ICommand {
  constructor(
    readonly orderId: string,
    readonly method: PaymentMethod,
  ) {}
}
