import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommunicationModule } from './modules/communication/communication.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { appConfig } from './libs/config/app.config';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    HttpModule,
    CqrsModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: '100_CALL_PER_MINUTE',
        ttl: 60000,
        limit: 100,
      },
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    CommunicationModule,
    AdvertisingModule,
    PaymentModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}