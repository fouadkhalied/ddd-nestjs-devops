import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AdvertisingController } from './api/rest/controller/advertising.controller';
import { AdvertisingRepositoryImpl } from './infrastructure/database/repository/advertising.repository';
import { AdMapper } from './infrastructure/database/mapper/ad.mapper';
import {
  ADVERTISING_REPOSITORY,
  CREATE_AD_USE_CASE,
  APPROVE_AD_USE_CASE,
  ASSIGN_CREDIT_USE_CASE,
} from './advertising.tokens';
import { CreateAdUseCase } from './application/use-case/create-ad.use-case';
import { ApproveAdUseCase } from './application/use-case/approve-ad.use-case';
import { AssignCreditUseCase } from './application/use-case/assign-credit.use-case';
import { CreateAdHandler } from './application/handler/command/create-ad.handler';
import { ApproveAdHandler } from './application/handler/command/approve-ad.handler';
import { AssignCreditHandler } from './application/handler/command/assign-credit.handler';
import { ActivateAdHandler } from './application/handler/command/activate-ad.handler';
import { DeactivateAdHandler } from './application/handler/command/deactivate-ad.handler';
import { RejectAdHandler } from './application/handler/command/reject-ad.handler';
import { UpdateAdHandler } from './application/handler/command/update-ad.handler';
import { DeleteAdHandler } from './application/handler/command/delete-ad.handler';
import { GetAdByIdHandler } from './application/handler/query/get-ad-by-id.handler';
import { GetAllAdsHandler } from './application/handler/query/get-all-ads.handler';
import { GetAdsByTitleHandler } from './application/handler/query/get-ads-by-title.handler';
import { GetApprovedAdsHandler } from './application/handler/query/get-ads-for-feed.handler';

const CommandHandlers = [
  CreateAdHandler,
  ApproveAdHandler,
  AssignCreditHandler,
  ActivateAdHandler,
  DeactivateAdHandler,
  RejectAdHandler,
  UpdateAdHandler,
  DeleteAdHandler,
];

const QueryHandlers = [
  GetAdByIdHandler,
  GetAllAdsHandler,
  GetAdsByTitleHandler,
  GetApprovedAdsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [AdvertisingController],
  providers: [
    AdMapper,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: ADVERTISING_REPOSITORY,
      useClass: AdvertisingRepositoryImpl,
    },
    {
      provide: CREATE_AD_USE_CASE,
      useClass: CreateAdUseCase,
    },
    {
      provide: APPROVE_AD_USE_CASE,
      useClass: ApproveAdUseCase,
    },
    {
      provide: ASSIGN_CREDIT_USE_CASE,
      useClass: AssignCreditUseCase,
    },
  ],
  exports: [ADVERTISING_REPOSITORY],
})
export class AdvertisingModule {}
