import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { isNone, Option } from 'effect/Option';
import { UpdatePaymentStatusCommand } from '../../command/update-payment-status.command';
import { PaymentRepository } from '../../../domain/repository/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../../../payment.tokens';
import { Payment } from '../../../domain/entity/payment.entity';
import { PaymentStatus } from '../../../domain/value-object/payment-status.enum';

@CommandHandler(UpdatePaymentStatusCommand)
export class UpdatePaymentStatusHandler
  implements ICommandHandler<UpdatePaymentStatusCommand>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdatePaymentStatusCommand): Promise<Option<Payment>> {
    const payment = await this.paymentRepository.findPaymentBySessionId(
      command.sessionId,
    );

    if (isNone(payment)) {
      throw new NotFoundException(
        `Payment with session ${command.sessionId} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(payment.value);

    // Update status using domain method
    if (command.status === PaymentStatus.COMPLETED) {
      payment.value.complete();
    } else if (command.status === PaymentStatus.FAILED) {
      payment.value.fail();
    }

    // Persist changes
    const updated = await this.paymentRepository.updatePaymentStatus(
      command.sessionId,
      command.status,
    );

    if (isNone(updated)) {
      throw new NotFoundException('Failed to update payment status');
    }

    updated.value.commit();

    return updated;
  }
}