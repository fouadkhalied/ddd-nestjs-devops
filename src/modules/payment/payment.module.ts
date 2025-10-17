import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCheckoutSessionHandler } from './application/handler/command/create-checkout-session.handler';
import { ProcessWebhookHandler } from './application/handler/command/process-webhook.handler';
import { VerifyPaymentHandler } from './application/handler/command/verify-payment.handler';
import { UpdatePaymentStatusHandler } from './application/handler/command/update-payment-status.handler';
import { CreatePaymentUseCase } from './application/use-case/create-payment.use-case';
import { ProcessWebhookUseCase } from './application/use-case/process-webhook.use-case';
import { PAYMENT_GATEWAY_FACTORY, CREATE_PAYMENT_USE_CASE, PROCESS_WEBHOOK_USE_CASE, PAYMENT_REPOSITORY } from './payment.tokens';
import { GetPurchaseHistoryAdminHandler } from './application/handler/query/get-purchase-history-admin.handler';
import { GetPurchaseHistoryHandler } from './application/handler/query/get-purchase-history.handler';
import { PaymentRepositoryImpl } from './infrastructure/database/repository/payment.repository';
import { PaymentGatewayFactory } from './infrastructure/gateway/payment-gateway.factory';
import { PaymentController } from './api/rest/controller/payment.controller';
import { PaymentMapper } from './infrastructure/database/mapper/payment.mapper';
const CommandHandlers = [
  CreateCheckoutSessionHandler,
    ProcessWebhookHandler,
    VerifyPaymentHandler,
    UpdatePaymentStatusHandler,
]

const QueryHandlers = [
  GetPurchaseHistoryHandler,
    GetPurchaseHistoryAdminHandler,
]
@Module({
  imports: [CqrsModule],
  controllers: [PaymentController],
  providers: [
    PaymentMapper,
    ...CommandHandlers,
    ...QueryHandlers,

    // Use Cases
    {
      provide: CREATE_PAYMENT_USE_CASE,
      useClass: CreatePaymentUseCase,
    },
    {
      provide: PROCESS_WEBHOOK_USE_CASE,
      useClass: ProcessWebhookUseCase,
    },

    // Repositories
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepositoryImpl,
    },

    // Gateways
    {
      provide: PAYMENT_GATEWAY_FACTORY,
      useClass: PaymentGatewayFactory,
    },
  ],
  exports: [
    CREATE_PAYMENT_USE_CASE,
    PROCESS_WEBHOOK_USE_CASE,
    PAYMENT_REPOSITORY,
    PAYMENT_GATEWAY_FACTORY,
  ],
})
export class PaymentModule {}