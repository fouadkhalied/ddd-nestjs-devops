// infrastructure/repositories/property.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventBus } from '@nestjs/cqrs';
import { Option, some, none } from 'effect/Option';

import { PropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/aggregates/property.aggregate';
import { PropertyEntity } from '../orm/property.entity';
import { PropertyFilters } from '../../domain/repositories/property.repository.interface';
import { PropertyMapper } from '../mappers/property.mapper';

@Injectable()
export class PropertyRepositoryImpl implements PropertyRepository {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepo: EntityRepository<PropertyEntity>,
    private readonly em: EntityManager,
    private readonly eventBus: EventBus, // For publishing domain events
    private readonly propertyMapper: PropertyMapper,
  ) {}

  async save(property: Property): Promise<void> {
    // Check if property already exists
    const existingEntity = await this.propertyRepo.findOne({
      id: property._id,
    });

    if (existingEntity) {
      // Update existing entity
      const updatedEntity = this.propertyMapper.toEntity(property);
      updatedEntity.id = existingEntity.id; // Preserve the existing ID

      this.em.assign(existingEntity, updatedEntity);
      await this.em.flush();
    } else {
      // Create new entity
      const entity = this.propertyMapper.toEntity(property);
      this.em.persist(entity);
      await this.em.flush();
    }

    // Get uncommitted events from the aggregate
    const events = property.getUncommittedEvents();

    // Publish domain events
    if (events.length > 0) {
      for (const event of events) {
        await this.eventBus.publish(event);
      }

      // Mark events as committed (clear them from aggregate)
      property.commit();
    }
  }

  async findById(id: string): Promise<Option<Property>> {
    const entity = await this.propertyRepo.findOne({ id });
    return entity ? some(this.propertyMapper.toDomain(entity)) : none();
  }

  async findByMlsId(mlsId: string): Promise<Option<Property>> {
    const entity = await this.propertyRepo.findOne({ mlsId });
    return entity ? some(this.propertyMapper.toDomain(entity)) : none();
  }

  async findByProjectId(projectId: string): Promise<Property[]> {
    // Changed from number to string
    const entities = await this.propertyRepo.find({
      projectId,
    });

    return this.propertyMapper.toDomainList(entities);
  }

  async findApprovedProperties(): Promise<Property[]> {
    const entities = await this.propertyRepo.find({
      is_approved: true,
    });

    return this.propertyMapper.toDomainList(entities);
  }

  async findPendingApproval(): Promise<Property[]> {
    const entities = await this.propertyRepo.find({
      is_approved: false,
    });

    return this.propertyMapper.toDomainList(entities);
  }

  async findByFilters(filters: PropertyFilters): Promise<Property[]> {
    const where: Partial<PropertyEntity> = {};

    // Apply filters dynamically
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.minPrice && filters.maxPrice) {
      // Handle price range filtering separately
      const entities = await this.propertyRepo.find({
        priceAmount: { $gte: filters.minPrice, $lte: filters.maxPrice },
      });
      return this.propertyMapper.toDomainList(entities);
    }

    if (filters.approved !== undefined) {
      where.is_approved = filters.approved;
    }

    if (filters.bedrooms) {
      where.bedrooms = filters.bedrooms;
    }

    // Add more filter conditions as needed...

    const entities = await this.propertyRepo.find(where);
    return this.propertyMapper.toDomainList(entities);
  }

  async remove(property: Property): Promise<void> {
    const entity = await this.propertyRepo.findOne({ id: property._id });
    if (entity) {
      this.em.remove(entity);
      await this.em.flush();
    }
  }

  async existsByMlsId(mlsId: string): Promise<boolean> {
    const count = await this.propertyRepo.count({ mlsId });
    return count > 0;
  }

  async countApproved(): Promise<number> {
    return await this.propertyRepo.count({ is_approved: true });
  }

  async countPendingApproval(): Promise<number> {
    return await this.propertyRepo.count({ is_approved: false });
  }
}
