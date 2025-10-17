import { ICommand } from '@nestjs/cqrs';
import { PaymentStatus } from '../../domain/value-object/payment-status.enum';

export class UpdatePaymentStatusCommand implements ICommand {
  constructor(
    readonly sessionId: string,
    readonly status: PaymentStatus,
  ) {}
}