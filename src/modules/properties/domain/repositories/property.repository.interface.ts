import { Option } from 'effect/Option';
import { Property } from '../aggregates/property.aggregate';

export interface PropertyRepository {
  // Aggregate root operations - load/save entire aggregate
  save(property: Property): Promise<void>;

  // Find aggregate by identity
  findById(id: string): Promise<Option<Property>>;
  findByMlsId(mlsId: string): Promise<Option<Property>>; // Business identifier

  // Query aggregates (business-focused)
  findByProjectId(projectId: string): Promise<Property[]>; // Changed from number to string
  findApprovedProperties(): Promise<Property[]>;
  findPendingApproval(): Promise<Property[]>;

  // Complex aggregate queries
  findByFilters(filters: PropertyFilters): Promise<Property[]>;

  // Remove aggregate
  remove(property: Property): Promise<void>; // Pass aggregate, not just ID

  // Business checks on aggregate
  existsByMlsId(mlsId: string): Promise<boolean>;

  // Aggregate counts
  countPendingApproval(): Promise<number>;
  countApproved(): Promise<number>;
}

export interface PropertyFilters {
  projectId?: string; // Changed from number to string
  minPrice?: number;
  maxPrice?: number;
  approved?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  listingType?: string;
}

// Pagination interface
export interface PaginatedPropertyResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Extended repository interface with pagination
export interface PropertyRepositoryExtended extends PropertyRepository {
  findWithPagination(
    filters: PropertyFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedPropertyResult>;

  findApprovedPropertiesWithPagination(
    page: number,
    limit: number,
  ): Promise<PaginatedPropertyResult>;
}
