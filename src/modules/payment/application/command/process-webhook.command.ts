import { ICommand } from '@nestjs/cqrs';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';

export class ProcessWebhookCommand implements ICommand {
  constructor(
    readonly payload: any,
    readonly method: PaymentMethod,
  ) {}
}