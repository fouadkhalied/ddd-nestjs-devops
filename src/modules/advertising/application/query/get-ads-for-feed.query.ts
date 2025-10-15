import { IQuery } from "@nestjs/cqrs";
import { AdParams } from "../../api/rest/presentation/params/ad.params";
import { KSACities } from "../../domain/value-object/ksa-cities.enum";

export class GetApprovedAdsQuery implements IQuery {
    constructor(
      readonly params?: AdParams,
      readonly targetCities?: KSACities[],
      readonly title?: string,
    ) {}
}