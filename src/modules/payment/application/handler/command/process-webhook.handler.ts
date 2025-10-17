import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProcessWebhookCommand } from '../../command/process-webhook.command';
import { ProcessWebhookUseCase } from '../../use-case/process-webhook.use-case';
import { PROCESS_WEBHOOK_USE_CASE } from '../../../payment.tokens';

@CommandHandler(ProcessWebhookCommand)
export class ProcessWebhookHandler
  implements ICommandHandler<ProcessWebhookCommand>
{
  constructor(
    @Inject(PROCESS_WEBHOOK_USE_CASE)
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  async execute(command: ProcessWebhookCommand): Promise<void> {
    await this.processWebhookUseCase.execute({
      payload: command.payload,
      method: command.method,
    });
  }
}