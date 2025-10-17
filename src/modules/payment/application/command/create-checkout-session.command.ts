import { ICommand } from '@nestjs/cqrs';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';

export class CreateCheckoutSessionCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly amount: number,
    readonly currency: string,
    readonly method: PaymentMethod,
  ) {}
}