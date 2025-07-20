import { Injectable } from '@nestjs/common';
import { Property } from '../../domain/aggregates/property.aggregate';
import { PropertyEntity } from '../orm/property.entity';

@Injectable()
export class PropertyMapper {
  /**
   * Maps a domain Property aggregate to a PropertyEntity for persistence
   */
  toEntity(property: Property): PropertyEntity {
    const entity = new PropertyEntity();

    // Map identity - only set if not already set
    if (!entity.id) {
      entity.id = property._id;
    }

    // Map business identifier
    entity.mlsId = property.mlsId;

    // Map properties
    entity.projectId = property['props'].projectId;
    entity.propertyTypeId = property['props'].propertyTypeId;
    entity.building = property['props'].building;
    entity.floor = property['props'].floor;
    entity.unit = property['props'].unit;

    // Map price information
    entity.priceAmount = property.priceAmount;
    entity.priceCurrency = property.priceCurrency;

    // Map property details
    entity.bedrooms = property['props'].bedrooms;
    entity.bathrooms = property['props'].bathrooms;
    entity.areaSqm = property['props'].areaSqm;
    entity.yearBuilt = property['props'].yearBuilt;
    entity.description = property['props'].description;
    entity.listingType = property['props'].listingType;

    // Map metadata
    entity.imagesCount = property['props'].imagesCount;
    entity.listedBy = property['props'].listedBy;
    entity.is_approved = property.isApproved;

    return entity;
  }

  /**
   * Maps a PropertyEntity to a domain Property aggregate
   */
  toDomain(entity: PropertyEntity): Property {
    // Reconstruct the aggregate from entity data
    const property = new Property(entity.id, {
      mlsId: entity.mlsId,
      projectId: entity.projectId,
      propertyTypeId: entity.propertyTypeId,
      building: entity.building,
      floor: entity.floor,
      unit: entity.unit,
      priceAmount: entity.priceAmount,
      priceCurrency: entity.priceCurrency,
      bedrooms: entity.bedrooms,
      bathrooms: entity.bathrooms,
      areaSqm: entity.areaSqm,
      yearBuilt: entity.yearBuilt,
      description: entity.description,
      listingType: entity.listingType,
      imagesCount: entity.imagesCount,
      listedBy: entity.listedBy,
      approved: entity.is_approved,
      createdAt: new Date(), // Since we removed these from entity, use current date
      updatedAt: new Date(),
    });

    // Important: Clear any uncommitted events since this is a reconstituted aggregate
    property.commit();

    return property;
  }

  /**
   * Maps a list of PropertyEntity to domain Property aggregates
   */
  toDomainList(entities: PropertyEntity[]): Property[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
