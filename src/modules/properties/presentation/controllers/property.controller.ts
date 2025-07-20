import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { isSome, isNone, getOrThrow } from 'effect/Option';
import { PublicApi } from '../../../../libs/decorator/auth.decorator';

// DTOs
import { SubmitPropertyDto } from '../dto/submit-property.dto';
import {
  PropertyResponseDto,
  PropertyListResponseDto,
} from '../dto/property-response.dto';

// Domain
import { Property } from '../../domain/aggregates/property.aggregate';
import { PropertyRepository } from '../../domain/repositories/property.repository.interface';

// Infrastructure
import { PROPERTY_REPOSITORY } from '../../properties.module';

@Controller('properties')
export class PropertyController {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
  ) {}

  @Post()
  @PublicApi()
  @HttpCode(HttpStatus.CREATED)
  async submitProperty(
    @Body() submitPropertyDto: SubmitPropertyDto,
  ): Promise<PropertyResponseDto> {
    // Check if property with MLS ID already exists
    const existingProperty = await this.propertyRepository.findByMlsId(
      submitPropertyDto.mlsId,
    );
    if (isSome(existingProperty)) {
      throw new ConflictException('Property with this MLS ID already exists');
    }

    // Create new property aggregate
    const property = Property.create(uuidv4(), {
      mlsId: submitPropertyDto.mlsId,
      projectId: submitPropertyDto.projectId,
      propertyTypeId: submitPropertyDto.propertyTypeId,
      building: submitPropertyDto.building,
      floor: submitPropertyDto.floor,
      unit: submitPropertyDto.unit,
      priceAmount: submitPropertyDto.priceAmount,
      priceCurrency: submitPropertyDto.priceCurrency,
      bedrooms: submitPropertyDto.bedrooms,
      bathrooms: submitPropertyDto.bathrooms,
      areaSqm: submitPropertyDto.areaSqm,
      yearBuilt: submitPropertyDto.yearBuilt,
      description: submitPropertyDto.description,
      listingType: submitPropertyDto.listingType,
      imagesCount: 0, // Default to 0
      listedBy: submitPropertyDto.listedBy,
    });

    // Save the property
    await this.propertyRepository.save(property);

    // Return the created property
    return this.toResponseDto(property);
  }

  @Get()
  @PublicApi()
  async getProperties(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('approved') approved?: boolean,
    @Query('projectId') projectId?: string, // Changed from number to string
  ): Promise<PropertyListResponseDto> {
    const filters = {
      approved,
      projectId,
    };

    const properties = await this.propertyRepository.findByFilters(filters);

    // Simple pagination (in a real app, you'd use the repository's pagination)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = properties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties.map((property) =>
        this.toResponseDto(property),
      ),
      total: properties.length,
      page,
      limit,
      hasNext: endIndex < properties.length,
      hasPrevious: page > 1,
    };
  }

  @Get('approved')
  @PublicApi()
  async getApprovedProperties(): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyRepository.findApprovedProperties();
    return properties.map((property) => this.toResponseDto(property));
  }

  @Get('pending')
  @PublicApi()
  async getPendingProperties(): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyRepository.findPendingApproval();
    return properties.map((property) => this.toResponseDto(property));
  }

  @Get(':id')
  @PublicApi()
  async getPropertyById(@Param('id') id: string): Promise<PropertyResponseDto> {
    const propertyOption = await this.propertyRepository.findById(id);

    if (isNone(propertyOption)) {
      throw new NotFoundException('Property not found');
    }

    return this.toResponseDto(getOrThrow(propertyOption));
  }

  @Get('mls/:mlsId')
  @PublicApi()
  async getPropertyByMlsId(
    @Param('mlsId') mlsId: string,
  ): Promise<PropertyResponseDto> {
    const propertyOption = await this.propertyRepository.findByMlsId(mlsId);

    if (isNone(propertyOption)) {
      throw new NotFoundException('Property not found');
    }

    return this.toResponseDto(getOrThrow(propertyOption));
  }

  @Put(':id/approve')
  @PublicApi()
  @HttpCode(HttpStatus.OK)
  async approveProperty(@Param('id') id: string): Promise<PropertyResponseDto> {
    const propertyOption = await this.propertyRepository.findById(id);

    if (isNone(propertyOption)) {
      throw new NotFoundException('Property not found');
    }

    const property = getOrThrow(propertyOption);

    // Check if already approved
    if (property.isApproved) {
      throw new ConflictException('Property is already approved');
    }

    property.approve();

    await this.propertyRepository.save(property);

    return this.toResponseDto(property);
  }

  @Delete(':id')
  @PublicApi()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProperty(@Param('id') id: string): Promise<void> {
    const propertyOption = await this.propertyRepository.findById(id);

    if (isNone(propertyOption)) {
      throw new NotFoundException('Property not found');
    }

    await this.propertyRepository.remove(getOrThrow(propertyOption));
  }

  @Get('stats/counts')
  @PublicApi()
  async getPropertyStats(): Promise<{
    approved: number;
    pending: number;
    total: number;
  }> {
    const [approved, pending] = await Promise.all([
      this.propertyRepository.countApproved(),
      this.propertyRepository.countPendingApproval(),
    ]);

    return {
      approved,
      pending,
      total: approved + pending,
    };
  }

  private toResponseDto(property: Property): PropertyResponseDto {
    return {
      id: property._id,
      mlsId: property.mlsId,
      projectId: property['props'].projectId,
      propertyTypeId: property['props'].propertyTypeId,
      building: property['props'].building,
      floor: property['props'].floor,
      unit: property['props'].unit,
      priceAmount: property.priceAmount,
      priceCurrency: property.priceCurrency,
      bedrooms: property['props'].bedrooms,
      bathrooms: property['props'].bathrooms,
      areaSqm: property['props'].areaSqm,
      yearBuilt: property['props'].yearBuilt,
      description: property['props'].description,
      listingType: property['props'].listingType,
      imagesCount: property['props'].imagesCount,
      listedBy: property['props'].listedBy,
      approved: property.isApproved,
      createdAt: property['props'].createdAt,
      updatedAt: property['props'].updatedAt,
    };
  }
}
