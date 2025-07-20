export class PropertyResponseDto {
  id!: string;
  mlsId!: string;
  projectId?: string; // Changed from number to string for UUID
  propertyTypeId?: string; // Changed from number to string for UUID
  building?: string;
  floor?: number;
  unit?: string;
  priceAmount?: number;
  priceCurrency?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  yearBuilt?: number;
  description?: string;
  listingType?: string;
  imagesCount!: number;
  listedBy?: string;
  approved!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PropertyListResponseDto {
  properties!: PropertyResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  hasNext!: boolean;
  hasPrevious!: boolean;
}
