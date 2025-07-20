import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';

// Infrastructure
import { PropertyEntity } from './infrastructure/orm/property.entity';
import { PropertyRepositoryImpl } from './infrastructure/repositories/property.repository.impl';
import { PropertyMapper } from './infrastructure/mappers/property.mapper';

// Domain

// Create a token for dependency injection
export const PROPERTY_REPOSITORY = 'PROPERTY_REPOSITORY';

// Application (if you have handlers/commands)
// import { CreatePropertyHandler } from './application/handlers/create-property.handler';
// import { GetPropertyHandler } from './application/handlers/get-property.handler';

// Presentation
import { PropertyController } from './presentation/controllers/property.controller';

@Module({
  imports: [MikroOrmModule.forFeature([PropertyEntity]), CqrsModule],
  providers: [
    PropertyMapper,
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepositoryImpl,
    },
    // Add your command/query handlers here
    // CreatePropertyHandler,
    // GetPropertyHandler,
  ],
  exports: [PROPERTY_REPOSITORY, PropertyMapper],
  controllers: [PropertyController],
})
export class PropertiesModule {}
