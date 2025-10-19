import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Redirect,
    BadRequestException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { CommandBus, QueryBus } from '@nestjs/cqrs';
  import { FastifyRequest } from 'fastify';
  import { AuthRoles, PublicApi } from '../../../../../libs/decorator/auth.decorator';
  import { ApiRole } from '../../../../../libs/api/api-role.enum';
  import { PaginatedResponse, toPaginatedResponse } from '../../../../../libs/api/rest/paginated.response.dto';
  import { Collection } from '../../../../../libs/api/rest/collection.interface';
import { CreateCheckoutSessionCommand } from 'src/modules/payment/application/command/create-checkout-session.command';
import { PaymentMethod } from 'src/modules/payment/domain/value-object/payment-method.enum';
import { ProcessWebhookCommand } from 'src/modules/payment/application/command/process-webhook.command';
import { VerifyPaymentCommand } from 'src/modules/payment/application/command/verify-payment.command';
import { UpdatePaymentStatusCommand } from 'src/modules/payment/application/command/update-payment-status.command';
import { PaymentStatus } from 'src/modules/payment/domain/value-object/payment-status.enum';
import { appConfig } from 'src/libs/config/app.config';
import { CreateCheckoutSessionBody } from '../presentation/body/create-checkout-session.body';
import { WebhookPayloadBody } from '../presentation/body/webhook-payload.body';
import { PaymentDto } from '../presentation/dto/payment.dto';
  
 
  
  // Placeholder query classes (to be implemented)
  class GetPurchaseHistoryQuery {
    constructor(
      public readonly userId: string,
      public readonly page: number,
      public readonly limit: number,
    ) {}
  }
  
  class GetPurchaseHistoryForAdminQuery {
    constructor(
      public readonly page: number,
      public readonly limit: number,
    ) {}
  }
  
  interface AuthRequest extends FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: number;
    };
  }
  
  @Controller('payment')
  export class PaymentController {
    constructor(
      private readonly commandBus: CommandBus,
      private readonly queryBus: QueryBus,
    ) {}
  
    @HttpCode(HttpStatus.OK)
    @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
    @Post('createSessionUrl')
    async createSession(
      @Body() body: CreateCheckoutSessionBody,
      @Req() req: AuthRequest,
    ): Promise<{ url: string; id: string }> {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }
  
      if (!body.amount || body.amount <= 0) {
        throw new BadRequestException('Valid amount is required');
      }
  
      if (!body.currency) {
        throw new BadRequestException('Currency is required');
      }
  
      const session = await this.commandBus.execute(
        new CreateCheckoutSessionCommand(
            userId,
            'user@email.com',
            body.amount,
            body.currency,
            PaymentMethod.PAYMOB
        )
      );
  
      if (!session.url) {
        throw new BadRequestException('Failed to create checkout session');
      }
  
      return { url: session.url, id: session.id };
    }
  
    @HttpCode(HttpStatus.OK)
    @PublicApi()
    @Post('webhook')
    async webhook(@Body() payload: WebhookPayloadBody): Promise<{ status: string }> {
      try {
        await this.commandBus.execute(
          new ProcessWebhookCommand(payload, PaymentMethod.PAYMOB), // Adjust method as needed
        );
        return { status: 'received' };
      } catch (error: any) {
        if (error.message.includes('signature') || error.message.includes('HMAC')) {
          throw new UnauthorizedException('Webhook verification failed');
        }
        throw new BadRequestException(`Webhook Error: ${error.message}`);
      }
    }
  
    @HttpCode(HttpStatus.FOUND)
    @PublicApi()
    @Get('redirect')
    @Redirect()
    async handleRedirect(@Query('order') orderId: string): Promise<{ url: string }> {
      if (!orderId) {
        throw new BadRequestException('Missing order ID in query params');
      }
  
      // Verify payment
      const paymentStatus = await this.commandBus.execute(
        new VerifyPaymentCommand(orderId, PaymentMethod.PAYMOB), // Adjust method as needed
      );
  
      if (paymentStatus.success) {
        // Update payment status to COMPLETED if not already done
        await this.commandBus.execute(
          new UpdatePaymentStatusCommand(orderId, PaymentStatus.COMPLETED),
        );
        return { url: `${appConfig}/?order=${orderId}` };
      } else {
        // Update payment status to FAILED
        await this.commandBus.execute(
          new UpdatePaymentStatusCommand(orderId, PaymentStatus.FAILED),
        );
        return { url: `${process.env.PAYMOB_SUCCESS_URL}/?order=${orderId}` };
      }
    }
  
    @HttpCode(HttpStatus.OK)
    @AuthRoles(ApiRole.USER)
    @Get('history')
    async getPurchaseHistory(
      @Req() req: AuthRequest,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponse<PaymentDto>> {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }
  
      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestException('Invalid pagination parameters');
      }
  
      const payments: Collection<PaymentDto> = await this.queryBus.execute(
        new GetPurchaseHistoryQuery(userId, page, limit),
      );
  
      return toPaginatedResponse(
        {
          items: payments.items, // Assumes PaymentDto mapping is handled in query
          total: payments.total,
        },
        page,
        limit,
      );
    }
  
    @HttpCode(HttpStatus.OK)
    @AuthRoles(ApiRole.ADMIN)
    @Get('history/admin')
    async getPurchaseHistoryForAdmin(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ): Promise<PaginatedResponse<PaymentDto>> {
      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestException('Invalid pagination parameters');
      }
  
      const payments: Collection<PaymentDto> = await this.queryBus.execute(
        new GetPurchaseHistoryForAdminQuery(page, limit),
      );
  
      return toPaginatedResponse(
        {
          items: payments.items, // Assumes PaymentDto mapping is handled in query
          total: payments.total,
        },
        page,
        limit,
      );
    }
  }