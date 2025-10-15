import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { isNone, Option } from 'effect/Option';
import { UseCase } from '../../../../libs/ddd/use-case.interface';
import { Ad } from '../../domain/entity/ad.entity';
import { AdvertisingRepository } from '../../domain/repository/advertising.repository.interface';
import { ADVERTISING_REPOSITORY } from '../../advertising.tokens';

export interface AssignCreditInput {
  userId: string;
  adId: string;
  credit: number;
}

@Injectable()
export class AssignCreditUseCase
  implements UseCase<AssignCreditInput, Option<Ad>>
{
  private readonly IMPRESSIONS_PER_SAR = 100; // Default ratio

  constructor(
    @Inject(ADVERTISING_REPOSITORY)
    private readonly advertisingRepository: AdvertisingRepository,
  ) {}

  async execute(input: AssignCreditInput): Promise<Option<Ad>> {
    // Check if user has sufficient balance
    const hasSufficientBalance =
      await this.advertisingRepository.hasSufficientBalance(
        input.userId,
        input.credit,
      );

    if (!hasSufficientBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate impressions based on credit
    const totalImpressions = input.credit * this.IMPRESSIONS_PER_SAR;

    // Execute transaction
    const updatedAd =
      await this.advertisingRepository.assignCreditToAdTransaction(
        input.userId,
        input.adId,
        input.credit,
        totalImpressions,
      );

    if (isNone(updatedAd)) {
      throw new BadRequestException('Failed to assign credit to ad');
    }

    return updatedAd;
  }
}
