import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FastifyRequest } from 'fastify';
import { getOrThrowWith, map } from 'effect/Option';
import {
  AuthRoles,
  PublicApi,
} from '../../../../../libs/decorator/auth.decorator';
import { ApiRole } from '../../../../../libs/api/api-role.enum';
import { CreateAdBody } from '../presentation/body/create-ad.body';
import { ApproveAdBody } from '../presentation/body/approve-ad.body';
import { AssignCreditBody } from '../presentation/body/assign-credit.body';
import { CreateAdCommand } from '../../../application/command/create-ad.command';
import { ApproveAdCommand } from '../../../application/command/approve-ad.command';
import { AssignCreditCommand } from '../../../application/command/assign-credit.command';
import { GetAdByIdQuery } from '../../../application/query/get-ad-by-id.query';
import { GetAllAdsQuery } from '../../../application/query/get-all-ads.query';
import { AdDto, toAdDto } from '../presentation/dto/ad.dto';
import { AdParams } from '../presentation/params/ad.params';
import { QueryParams } from '../../../../../libs/decorator/query-params.decorator';
import { QueryParamsValidationPipe } from '../../../../../libs/pipe/query-params-validation.pipe';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from '../../../../../libs/api/rest/paginated.response.dto';
import { Collection } from '../../../../../libs/api/rest/collection.interface';
import { Ad } from '../../../domain/entity/ad.entity';
import { AdStatus } from '../../../domain/value-object/ad-status.enum';

interface AuthRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: number;
  };
}

@Controller('ads')
export class AdvertisingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Post()
  async createAd(
    @Body() body: CreateAdBody,
    @Req() req: AuthRequest,
  ): Promise<{ id: string }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return getOrThrowWith(
      map(
        await this.commandBus.execute(
          new CreateAdCommand(
            userId,
            body.titleEn,
            body.titleAr,
            body.descriptionEn,
            body.descriptionAr,
            body.websiteUrl,
            body.budgetType,
            body.targetCities,
          ),
        ),
        (ad: Ad) => ({ id: ad.id }),
      ),
      () => new NotFoundException('Error creating ad'),
    );
  }

  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Get(':id')
  async getAd(@Param('id') id: string): Promise<AdDto> {
    return getOrThrowWith(
      map(await this.queryBus.execute(new GetAdByIdQuery(id)), toAdDto),
      () => new NotFoundException(`Ad with id ${id} not found`),
    );
  }

  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Get()
  async getAds(
    @QueryParams(new QueryParamsValidationPipe()) params: AdParams,
    @Req() req: AuthRequest,
  ): Promise<PaginatedResponse<AdDto>> {
    const userId = req.user?.role === ApiRole.USER ? req.user.id : undefined;
    const status = params.filter?.status;

    const ads: Collection<Ad> = await this.queryBus.execute(
      new GetAllAdsQuery(params, status, userId),
    );

    return toPaginatedResponse(
      {
        items: ads.items.map(toAdDto),
        total: ads.total,
      },
      params.offset,
      params.limit,
    );
  }

  @HttpCode(HttpStatus.OK)
  @AuthRoles(ApiRole.ADMIN)
  @Post(':id/approve')
  async approveAd(
    @Param('id') id: string,
    @Body() body: ApproveAdBody,
  ): Promise<AdDto> {
    return getOrThrowWith(
      map(
        await this.commandBus.execute(new ApproveAdCommand(id, body)),
        toAdDto,
      ),
      () => new NotFoundException(`Failed to approve ad with id ${id}`),
    );
  }

  @HttpCode(HttpStatus.OK)
  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Post(':id/credit')
  async assignCredit(
    @Param('id') id: string,
    @Body() body: AssignCreditBody,
    @Req() req: AuthRequest,
  ): Promise<AdDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return getOrThrowWith(
      map(
        await this.commandBus.execute(
          new AssignCreditCommand(userId, id, body.credit),
        ),
        toAdDto,
      ),
      () =>
        new NotFoundException(`Failed to assign credit to ad with id ${id}`),
    );
  }
}
