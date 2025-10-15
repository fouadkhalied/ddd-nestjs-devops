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
  Req,
  Query,
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
import { ActivateAdCommand } from '../../../application/command/activate-ad.command';
import { DeactivateAdCommand } from '../../../application/command/deactivate-ad.command';
import { RejectAdCommand } from '../../../application/command/reject-ad.command';
import { DeleteAdCommand } from '../../../application/command/delete-ad.command';
import { GetAdByIdQuery } from '../../../application/query/get-ad-by-id.query';
import { GetAllAdsQuery } from '../../../application/query/get-all-ads.query';
import { GetApprovedAdsQuery } from "../../../application/query/get-ads-for-feed.query";
import { AdDto, toAdDto } from '../presentation/dto/ad.dto';
import { AdParams } from '../presentation/params/ad.params';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from '../../../../../libs/api/rest/paginated.response.dto';
import { Collection } from '../../../../../libs/api/rest/collection.interface';
import { Ad } from '../../../domain/entity/ad.entity';
import { AdFilterParams } from '../presentation/params/ad-filter.params';
import { allKsaCities, KSACities } from 'src/modules/advertising/domain/value-object/ksa-cities.enum';

interface AuthRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: number;
  };
}

@Controller('advertising')
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
    @Query() params: AdParams,
    @Req() req: AuthRequest,
  ): Promise<PaginatedResponse<AdDto>> {
    const userId = req.user?.role === ApiRole.USER ? req.user.id : undefined;
    const status = params.status;

    const ads: Collection<Ad> = await this.queryBus.execute(
      new GetAllAdsQuery(
        {
          offset: params.offset ?? 0,
          limit: params.limit ?? 10,
        },
        status,
        userId,
      ),
    );
    return toPaginatedResponse(
      {
        items: ads.items.map(toAdDto),
        total: ads.total,
      },
      params.offset ?? 0,
      params.limit ?? 10,
    );
  }

@Get('/listApprovedAdsForUser')
@PublicApi()
async getAdsForFeed(
  @Query() params: AdFilterParams,
): Promise<PaginatedResponse<any>> {

  const validCities: KSACities[] = [];

if (params.targetCities) {
  const cities = Array.isArray(params.targetCities)
    ? params.targetCities
    : [params.targetCities];

  for (const city of cities) {
    if (!allKsaCities.includes(city as KSACities)) {
      throw new Error(`❌ Invalid city: ${city}. Must be one of ${allKsaCities.join(', ')}`);
    }
    validCities.push(city as KSACities);
  }
}

  const ads: Collection<Ad> = await this.queryBus.execute(
    new GetApprovedAdsQuery(params, validCities, params.titleEn),
  );

  return toPaginatedResponse(
    {
      items: ads.items.map(toAdDto),
      total: ads.total,
    },
    1,
    10,
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
  @AuthRoles(ApiRole.ADMIN)
  @Post(':id/activate')
  async activateAd(@Param('id') id: string): Promise<AdDto> {
    return getOrThrowWith(
      map(
        await this.commandBus.execute(new ActivateAdCommand(id)),
        toAdDto,
      ),
      () => new NotFoundException(`Failed to activate ad with id ${id}`),
    );
  }

  @HttpCode(HttpStatus.OK)
  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Post(':id/deactivate')
  async deactivateAd(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<AdDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not found');
    }

    return getOrThrowWith(
      map(
        await this.commandBus.execute(new DeactivateAdCommand(userId, id)),
        toAdDto,
      ),
      () => new NotFoundException(`Failed to deactivate ad with id ${id}`),
    );
  }

  @HttpCode(HttpStatus.OK)
  @AuthRoles(ApiRole.ADMIN)
  @Post(':id/reject')
  async rejectAd(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ): Promise<AdDto> {
    return getOrThrowWith(
      map(
        await this.commandBus.execute(new RejectAdCommand(id, body.reason)),
        toAdDto,
      ),
      () => new NotFoundException(`Failed to reject ad with id ${id}`),
    );
  }

  @HttpCode(HttpStatus.OK)
  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Post(':id/assign-credit')
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

  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthRoles(ApiRole.USER, ApiRole.ADMIN)
  @Delete(':id')
  async deleteAd(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteAdCommand(id));
  }
  
}